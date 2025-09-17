import { createId } from "@paralleldrive/cuid2";
import { customAlphabet } from "nanoid";

const lowercaseAlphabet = "abcdefghijklmnopqrstuvwxyz";
const uppercaseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "1234567890";

export const nanoid = customAlphabet(
  lowercaseAlphabet + uppercaseAlphabet + numbers,
  10,
);

export const cuid = createId;
