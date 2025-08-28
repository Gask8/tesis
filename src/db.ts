import { Pool } from "pg";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = process.env.SECRET_NAME || "prod";
const client = new SecretsManagerClient({
  region: "us-east-2",
});

async function createPool() {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT",
      })
    );

    // Parse the secret string into an object
    const secretData = JSON.parse(response.SecretString || "{}");

    // Create pool with secrets
    const pool = new Pool({
      host: secretData.DB_HOST,
      port: parseInt(secretData.DB_PORT || "5432"),
      database: secretData.DB_NAME,
      user: secretData.DB_USER,
      password: secretData.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    return pool;
  } catch (error) {
    console.error("Error fetching secrets:", error);
    throw error;
  }
}

// Create a variable to store the pool
let pool: Pool;

// Initialize the pool
createPool()
  .then((createdPool) => {
    pool = createdPool;
  })
  .catch((error) => {
    console.error("Failed to initialize pool:", error);
    process.exit(1);
  });

// Export the query function
export const query = async (text: string, params?: any[]) => {
  if (!pool) {
    throw new Error("Database pool not initialized");
  }
  return pool.query(text, params);
};
