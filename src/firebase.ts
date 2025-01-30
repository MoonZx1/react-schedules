import { getDatabase, ref, set } from "firebase/database";
import { app } from "./firebaseConfig";

const database = getDatabase(app);

export const saveDataToFirebase = async (data: { id: string; subject: string; instructor: string }) => {
  try {
    const dataRef = ref(database, `schedules/${data.id}`);
    await set(dataRef, data);
    console.log("Data saved successfully:", data);
  } catch (error) {
    console.error("Error saving data:", error);
    throw error;
  }
};
