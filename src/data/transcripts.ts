import type { Transcript } from "@/types";
import transcriptsJson from "./transcripts.json";

// Type assertion to ensure the JSON data matches our Transcript interface
const transcripts: Transcript[] = transcriptsJson;

export default transcripts; 
