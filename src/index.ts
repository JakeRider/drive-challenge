#!/usr/bin/env ts-node

import readline from 'readline';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

enum Command {
  Partner = 'Partner',
  Company = 'Company',
  Employee = 'Employee',
  Contact = 'Contact',
}

const schema = /* sql */ `
  CREATE TABLE partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name TEXT NOT NULL UNIQUE,
    company_id INTEGER NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies (id)
  );

  CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    partner_id INTEGER NOT NULL,
    contact_type TEXT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees (id),
    FOREIGN KEY (partner_id) REFERENCES partners (id)
  );
`;

async function main() {
  const db = await open({ filename: ':memory:', driver: sqlite3.Database });

  await db.exec(schema);

  const lines = readline.createInterface(process.stdin);

  for await (const line of lines) {
    const tokens = line.split(' ');

    switch (tokens[0]) {
      case Command.Partner:
        await db.run(
          'INSERT INTO partners (partner_name) VALUES (?)',
          tokens[1]
        );
        break;
      case Command.Company:
        await db.run(
          'INSERT INTO companies (company_name) VALUES (?)',
          tokens[1]
        );
        break;
      case Command.Employee:
        const { id } = await db.get(
          'SELECT id FROM companies WHERE company_name = ?',
          tokens[2]
        );
        await db.run(
          'INSERT INTO employees (employee_name, company_id) VALUES (?, ?)',
          tokens[1],
          id
        );
        break;
      case Command.Contact:
        const { id: employeeId } = await db.get(
          'SELECT id FROM employees WHERE employee_name = ?',
          tokens[1]
        );
        const { id: partnerId } = await db.get(
          'SELECT id FROM partners WHERE partner_name = ?',
          tokens[2]
        );

        if (!['email', 'call', 'coffee'].includes(tokens[3]))
          throw new Error(`Unknown contact type: ${tokens[3]}`);

        await db.run(
          'INSERT INTO contacts (employee_id, partner_id, contact_type) VALUES (?, ?, ?)',
          employeeId,
          partnerId,
          tokens[3]
        );
        break;
      default:
        throw new Error(`Unknown command type: ${tokens[0]}`);
    }
  }

  const companies = await db.all(
    'SELECT * FROM companies ORDER BY company_name'
  );

  const results = await Promise.all(
    companies.map(async (company) => {
      const results = await db.get(
        /* sql */ `
        SELECT partner_name, count(contacts.id) FROM contacts
        INNER JOIN employees ON contacts.employee_id = employees.id AND employees.company_id = ?
        INNER JOIN partners ON contacts.partner_id = partners.id
        GROUP BY partner_name
        ORDER BY count(contacts.id) DESC
      `,
        company.id
      );

      return results
        ? `${company.company_name}: ${results['partner_name']} (${results['count(contacts.id)']})`
        : `${company.company_name}: No current relationship`;
    })
  );

  console.log(results);

  await db.close();

  console.log('Done');
}

main();
