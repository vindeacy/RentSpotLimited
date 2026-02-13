import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function fixMissingProfiles() {
  try {
    console.log('Finding users without tenant/landlord profiles...');
    
    // Find all users
    const users = await prisma.user.findMany({
      include: {
        tenant: true,
        landlord: true
      }
    });
    
    for (const user of users) {
      if (user.role === 'tenant' && !user.tenant) {
        console.log(`Creating tenant profile for user: ${user.email}`);
        await prisma.tenant.create({
          data: {
            userId: user.id
          }
        });
      } else if (user.role === 'landlord' && !user.landlord) {
        console.log(`Creating landlord profile for user: ${user.email}`);
        await prisma.landlord.create({
          data: {
            userId: user.id
          }
        });
      }
    }
    
    console.log('Profile fix complete!');
  } catch (error) {
    console.error('Error fixing profiles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingProfiles();
