import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to fix users...");

  // 1. Ensure Super Admin is set up correctly
  const admin = await prisma.user.findUnique({ where: { email: 'team@yudi.co.in' } });
  if (admin) {
    await prisma.user.update({
      where: { email: 'team@yudi.co.in' },
      data: { role: 'SUPER_ADMIN', status: 'ACTIVE' }
    });
    console.log("Super Admin (team@yudi.co.in) ensured as ACTIVE and SUPER_ADMIN.");
  } else {
    console.log("Super Admin (team@yudi.co.in) not found. Make sure to register them if needed.");
  }

  // 2. Ensure Founder is ACTIVE and get their company name
  const founder = await prisma.user.findUnique({
    where: { email: 'manishragella.yudi@gmail.com' }
  });

  if (!founder) {
    console.log("Founder (manishragella.yudi@gmail.com) not found in DB! Please register the founder first.");
    return;
  }

  await prisma.user.update({
    where: { email: 'manishragella.yudi@gmail.com' },
    data: { role: 'FOUNDER', status: 'ACTIVE' }
  });
  console.log(`Founder ensured as ACTIVE. Company Name: "${founder.companyName}"`);

  // 3. Fix the Employee account
  const employee = await prisma.user.findUnique({
    where: { email: 'manishindeedtax@gmail.com' }
  });

  if (!employee) {
    console.log("Employee (manishindeedtax@gmail.com) not found in DB! Please register the employee first.");
    return;
  }

  await prisma.user.update({
    where: { email: 'manishindeedtax@gmail.com' },
    data: { 
      companyName: founder.companyName, // Must match EXACTLY for the Founder to see them
      status: 'AWAITING_APPROVAL'       // Must be AWAITING_APPROVAL to show up in the approval list
    }
  });

  console.log("Employee fixed! Their company name now matches the Founder and status is AWAITING_APPROVAL.");
  console.log("You can now log in as the Founder and approve this employee.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
