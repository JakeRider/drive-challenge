import mockStdin from 'mock-stdin';
import { main, processLine } from './index';

describe('processLine', () => {
  const db = {
    run: jest.fn(),
    get: jest.fn(() => ({ id: 1 })),
  };

  it('should process the Partner command', async () => {
    await processLine('Partner Molly', db as any);

    expect(db.run).toHaveBeenCalledWith(
      'INSERT INTO partners (partner_name) VALUES (?)',
      'Molly'
    );
  });

  it('should process the Company command', async () => {
    await processLine('Company Globex', db as any);

    expect(db.run).toHaveBeenCalledWith(
      'INSERT INTO companies (company_name) VALUES (?)',
      'Globex'
    );
  });

  it('should process the Employee command', async () => {
    await processLine('Employee Laurie Globex', db as any);

    expect(db.run).toHaveBeenCalledWith(
      'INSERT INTO employees (employee_name, company_id) VALUES (?, ?)',
      'Laurie',
      1
    );
  });

  it('should process the Contact command', async () => {
    await processLine('Contact Laurie Chris email', db as any);

    expect(db.run).toHaveBeenCalledWith(
      'INSERT INTO contacts (employee_id, partner_id, contact_type) VALUES (?, ?, ?)',
      1,
      1,
      'email'
    );
  });

  it('should throw an error for invalid contact types', async () => {
    await expect(
      processLine('Contact Laurie Chris invalid', db as any)
    ).rejects.toThrow('Unknown contact type: invalid');
  });

  it('should throw an error for unknown commands', async () => {
    await expect(processLine('Unknown command', db as any)).rejects.toThrow(
      'Unknown command type: Unknown'
    );
  });
});

describe('command line tool', () => {
  let stdin: ReturnType<typeof mockStdin.stdin>;

  const input = `Partner Chris
Partner Molly
Company Globex
Company ACME
Employee Laurie Globex
Company Hooli
Employee Abdi Hooli
Employee Jamie Globex
Contact Laurie Chris email
Contact Laurie Molly call
Partner Rezzan
Contact Abdi Molly email
Contact Laurie Chris coffee
`;

  const expectedOutput = `ACME: No current relationship
Globex: Chris (2)
Hooli: Molly (1)
`;

  beforeEach(() => {
    stdin = mockStdin.stdin();
  });

  const execute = async (input: string): Promise<void> => {
    await main();
    stdin.send(input);
    stdin.end();
  };

  it('should all work together', () => {
    const log = jest.spyOn(console, 'log');
    execute(input).then(() => {
      expect(log).toHaveBeenCalledWith(expectedOutput);
    });
  });
});
