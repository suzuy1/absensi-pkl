const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Memulai seeding data default...')

  // Hapus data lama untuk mencegah duplikasi jika dijalankan ulang
  await prisma.absensi.deleteMany({})
  await prisma.user.deleteMany({})

  // Enkripsi password default
  const adminPassword = await bcrypt.hash('admin', 10)
  const pembimbingPassword = await bcrypt.hash('pembimbing', 10)
  const alifPassword = await bcrypt.hash('alif', 10)
  const fatirPassword = await bcrypt.hash('fatir', 10)

  // 1. Buat Data Users
  const admin = await prisma.user.create({
    data: {
      nama: 'Administrator',
      username: 'admin',
      password: adminPassword,
      role: 'admin',
    },
  })

  const pembimbing = await prisma.user.create({
    data: {
      nama: 'Pembimbing',
      username: 'pembimbing',
      password: pembimbingPassword,
      role: 'pembimbing',
    },
  })

  const alif = await prisma.user.create({
    data: {
      nama: 'alif alfiansyah',
      username: 'alif',
      password: alifPassword,
      role: 'anak_pkl',
      sekolah: 'politeknik aceh',
      jurusan: 'teknologi informasi',
      tgl_mulai: new Date('2026-02-24'),
      tgl_selesai: new Date('2026-07-24'),
    },
  })

  const fatir = await prisma.user.create({
    data: {
      nama: 'm.fatir',
      username: 'fatir',
      password: fatirPassword,
      role: 'anak_pkl',
    },
  })

  // 2. Buat Data Absensi Awal
  await prisma.absensi.create({
    data: {
      user_id: fatir.id,
      tanggal: new Date('2026-06-22'),
      jam_hadir: '15:45:37',
      lokasi: 'Jalan Nyak Adam Kamil III, Neusu Jaya, Baiturrahman, Banda Aceh, Aceh, Sumatra, 23116, Indonesia',
      status: 'Hadir',
      latitude: '5.5454310747739015',
      longitude: '95.31734924775125',
      jam_pulang: '15:45:41',
    },
  })

  await prisma.absensi.create({
    data: {
      user_id: alif.id,
      tanggal: new Date('2026-06-22'),
      jam_hadir: '22:42:58',
      lokasi: 'Jalan Syiah Kuala, Lamdingin, Kuta Alam, Banda Aceh, Aceh, Sumatra, 23126, Indonesia',
      status: 'Hadir',
      latitude: '5.570076142572362',
      longitude: '95.32931735026096',
    },
  })

  console.log('Seeding selesai! Semua akun default dan data awal berhasil dibuat di Supabase.')
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
