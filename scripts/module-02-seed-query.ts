import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const uniqueCode = `short-${Math.random().toString(36).substring(2, 8)}`;
  const targetLongUrl = 'https://example.com';
  const testUser = 'user_testing_99';

 const result = await prisma.link.upsert({
  where: {
    longUrl_createdBy: {
      longUrl: targetLongUrl,
      createdBy: testUser,
    },
  },
  update: {},
  create: {
    code: uniqueCode,
    longUrl: targetLongUrl,
    createdBy: testUser,
  },
});

const selectedLink = await prisma.link.findUnique({
  where: {
    code: result.code,
  },
});

 
  

  // 3. Print output that includes the required fields
  
  if (selectedLink) {
    console.log(`inserted code: ${result.code}`);
    console.log(`selected code: ${selectedLink.code}`);
    console.log(`matched long_url: ${selectedLink.longUrl}`);
    
  } else {
    console.error('Failed to query the link back from the database.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });