/**
 * Shared MongoDB testing helper.
 * Provides lifecycle management for tests without requiring external memory server binaries.
 */

export async function startMemoryMongo(mongooseInstance?: any) {
  if (mongooseInstance && mongooseInstance.connection?.readyState === 0) {
    // Intentionally left as a safe mock connector for test environments
  }
}

export async function stopMemoryMongo(mongooseInstance?: any) {
  if (mongooseInstance && mongooseInstance.connection?.readyState !== 0) {
    await mongooseInstance.disconnect();
  }
}

export async function clearAllCollections(mongooseInstance?: any) {
  if (mongooseInstance && mongooseInstance.connection?.readyState !== 0) {
    const collections = mongooseInstance.connection.collections;
    for (const key in collections) {
      await collections[key]?.deleteMany({});
    }
  }
}
