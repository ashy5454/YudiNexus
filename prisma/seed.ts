import { PrismaClient, Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed with live test emails...')

  // 1. Create the SUPER_ADMIN account (Main Admin)
  const superAdminPassword = await bcrypt.hash('YudiNexHQ@2026!', 12)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'team@yudi.co.in' },
    update: { passwordHash: superAdminPassword, status: UserStatus.ACTIVE },
    create: {
      email: 'team@yudi.co.in',
      passwordHash: superAdminPassword,
      firstName: 'YudiNex',
      lastName: 'HQ',
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      designation: 'Main Administrator',
    },
  })
  console.log(`✅ Super Admin: ${superAdmin.email}`)

  // 2. Create the Founder (ACTIVE so we can test the full flow)
  const founderPassword = await bcrypt.hash('Founder@2026!', 12)
  const founder = await prisma.user.upsert({
    where: { email: 'manishragella.yudi@gmail.com' },
    update: { passwordHash: founderPassword, status: UserStatus.ACTIVE, companyName: 'Yudi Innovations' },
    create: {
      email: 'manishragella.yudi@gmail.com',
      passwordHash: founderPassword,
      firstName: 'Manish',
      lastName: 'Ragella',
      role: Role.FOUNDER,
      status: UserStatus.ACTIVE, // Active so they can login and test
      companyName: 'Yudi Innovations',
      designation: 'CEO',
      approvedById: superAdmin.id,
      approvedAt: new Date(),
    },
  })
  console.log(`✅ Founder (Active): ${founder.email}`)

  // 3. Create the Employee (AWAITING_APPROVAL so founder can test approval flow)
  const empPassword = await bcrypt.hash('Employee@2026!', 12)
  const employee = await prisma.user.upsert({
    where: { email: 'manishmani41169@gmail.com' },
    update: { passwordHash: empPassword, status: UserStatus.AWAITING_APPROVAL, companyName: 'Yudi Innovations' },
    create: {
      email: 'manishmani41169@gmail.com',
      passwordHash: empPassword,
      firstName: 'Manish',
      lastName: 'Mani',
      role: Role.EMPLOYEE,
      status: UserStatus.AWAITING_APPROVAL, // Awaiting so Founder can test approval
      companyName: 'Yudi Innovations', // Must match founder's company
      designation: 'Product Manager',
    },
  })
  console.log(`✅ Employee (Awaiting Approval): ${employee.email}`)

  // 4. Create a Sample Project owned by the Founder
  const existingProject = await prisma.project.findFirst({
    where: { ownerId: founder.id }
  })
  
  if (!existingProject) {
    const project = await prisma.project.create({
      data: {
        name: 'Nexus Core Development',
        description: 'Building the next-gen intelligence platform for teams.',
        type: 'SOFTWARE',
        status: 'ACTIVE',
        startDate: new Date(),
        ownerId: founder.id, // Required field - must be set
      }
    })
    console.log(`✅ Sample Project created: ${project.name}`)
  } else {
    console.log(`✅ Project already exists: ${existingProject.name}`)
  }

  console.log('\n🎉 Seed complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Login credentials:')
  console.log('  Super Admin → team@yudi.co.in         / YudiNexHQ@2026!')
  console.log('              → Portal: /auth/founder/login')
  console.log('  Founder     → manishragella.yudi@gmail.com / Founder@2026!')
  console.log('              → Portal: /auth/founder/login')
  console.log('  Employee    → manishmani41169@gmail.com   / Employee@2026!')
  console.log('              → Portal: /auth/login (after founder approves)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
