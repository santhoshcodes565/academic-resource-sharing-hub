import { initDatabase, db } from './config/db.js';
import bcrypt from 'bcryptjs';

async function runSeed() {
  console.log('🌱 Starting Academic Resource Sharing Hub (ARH) DB Seeding...');
  await initDatabase();

  const facultyPasswordHash = await bcrypt.hash('Faculty@1234', 10);
  const studentPasswordHash = await bcrypt.hash('Student@1234', 10);

  // Check if faculty exists
  const existingFaculty = await db.findUserByEmail('dr.morales@university.edu');
  if (!existingFaculty) {
    await db.createUser({
      email: 'dr.morales@university.edu',
      password_hash: facultyPasswordHash,
      full_name: 'Dr. Evelyn Morales',
      role: 'faculty',
      department: 'Computer Science',
      academic_year: 'Tenured Faculty',
      semester: 'N/A'
    });
    console.log('✅ Created Initial Faculty Account: dr.morales@university.edu / Faculty@1234');
  } else {
    console.log('ℹ️  Initial Faculty Account already exists.');
  }

  // Check if student exists
  const existingStudent = await db.findUserByEmail('alex.chen@student.university.edu');
  if (!existingStudent) {
    await db.createUser({
      email: 'alex.chen@student.university.edu',
      password_hash: studentPasswordHash,
      full_name: 'Alex Chen',
      role: 'student',
      department: 'Computer Science',
      academic_year: 'Senior (4th Year)',
      semester: 'Semester 7'
    });
    console.log('✅ Created Demo Student Account: alex.chen@student.university.edu / Student@1234');
  } else {
    console.log('ℹ️  Demo Student Account already exists.');
  }

  console.log('🎉 Seeding completed successfully.');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
