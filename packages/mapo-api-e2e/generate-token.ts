// For local development, utility to generate auth tokens

import { generateToken } from "./e2e/util";

const token = generateToken('AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA')
console.log(token);