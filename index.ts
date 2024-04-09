import { testCombine } from "./test-functions";

export const handler = async () => {
  try {
    await testCombine();
  } catch (error) {
    console.error(error);
  }
};
