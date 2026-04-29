import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleImages = [
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop", // Construction tools
  "https://images.unsplash.com/photo-1590069230002-70cc884979fd?q=80&w=800&auto=format&fit=crop", // Bricks
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop", // Wood
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop", // Construction site
];

async function main() {
  console.log('Start seeding...');

  // 1. General Construction Materials
  const cat1 = await prisma.category.upsert({
    where: { slug: 'zahalnobudivelni-materialy' },
    update: {},
    create: {
      name: 'Загальнобудівельні матеріали',
      name_uk: 'Загальнобудівельні матеріали',
      slug: 'zahalnobudivelni-materialy',
      image: sampleImages[0],
      subcategories: {
        create: [
          { name: 'Цегла та блоки', name_uk: 'Цегла та блоки', slug: 'tsehla-ta-bloky', image: sampleImages[1] },
          { name: 'Бетон та розчини', name_uk: 'Бетон та розчини', slug: 'beton-ta-rozchyny', image: sampleImages[0] },
          { name: 'Пиломатеріали', name_uk: 'Пиломатеріали', slug: 'pylomaterialy', image: sampleImages[2] },
          { name: 'Металопрокат', name_uk: 'Металопрокат', slug: 'metaloprokat', image: sampleImages[3] },
        ]
      }
    }
  });

  // 2. Roofing & Facade
  const cat2 = await prisma.category.upsert({
    where: { slug: 'pokrivlya-ta-fasad' },
    update: {},
    create: {
      name: 'Покрівля та фасад',
      name_uk: 'Покрівля та фасад',
      slug: 'pokrivlya-ta-fasad',
      image: sampleImages[3],
      subcategories: {
        create: [
          { name: 'Металочерепиця', name_uk: 'Металочерепиця', slug: 'metalocherepytsya', image: sampleImages[3] },
          { name: 'Бітумна черепиця', name_uk: 'Бітумна черепиця', slug: 'bitumna-cherepytsya', image: sampleImages[0] },
          { name: 'Утеплювачі', name_uk: 'Утеплювачі', slug: 'uteplyuvachi', image: sampleImages[1] },
          { name: 'Сайдинг', name_uk: 'Сайдинг', slug: 'saydynh', image: sampleImages[2] },
        ]
      }
    }
  });

  // 3. Finishing Materials
  const cat3 = await prisma.category.upsert({
    where: { slug: 'ozdoblyuvalni-materialy' },
    update: {},
    create: {
      name: 'Оздоблювальні матеріали',
      name_uk: 'Оздоблювальні матеріали',
      slug: 'ozdoblyuvalni-materialy',
      image: sampleImages[1],
      subcategories: {
        create: [
          { name: 'Гіпсокартонні системи', name_uk: 'Гіпсокартонні системи', slug: 'hipsokartonni-systemy', image: sampleImages[1] },
          { name: 'Сухі суміші', name_uk: 'Сухі суміші', slug: 'sukhi-sumishi', image: sampleImages[0] },
          { name: 'Фарби та лаки', name_uk: 'Фарби та лаки', slug: 'farby-ta-laky', image: sampleImages[3] },
          { name: 'Плитка', name_uk: 'Плитка', slug: 'plytka', image: sampleImages[2] },
        ]
      }
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
