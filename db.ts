import Airtable from 'airtable';
import { airtableOpts } from './config';

const airtable = new Airtable({ apiKey: airtableOpts.apiKey }).base(airtableOpts.baseId);

export const createUser = (fields: { name: string, email: string, inviteLink: string, telegramId: number }) => {
  airtable.table('Users').create([{ fields }], errorHandler);
}

function errorHandler(err) {
  if (err) {
    console.error(err);
  }
}