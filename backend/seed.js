/* ==========================================================================
   SEED SCRIPT — populates the database with a demo organizer + sample events
   Run with: node seed.js
   ========================================================================== */
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');

dotenv.config();

const sampleEvents = [
  {
    title: 'Bangalore Tech Summit 2026',
    description: 'A full-day conference featuring talks on AI, cloud computing, and the future of full-stack development. Network with industry leaders and attend hands-on workshops.',
    category: 'Tech',
    banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    venue: 'HSR Layout Convention Center, Bangalore',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    time: '09:00',
    price: 999,
    totalSeats: 200
  },
  {
    title: 'Sunburn Music Festival',
    description: 'India\'s biggest electronic dance music festival returns with top international DJs, immersive stage design, and an unforgettable night of music.',
    category: 'Music',
    banner: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    venue: 'Palace Grounds, Bangalore',
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    time: '18:00',
    price: 1499,
    totalSeats: 500
  },
  {
    title: 'React & Node.js Bootcamp',
    description: 'A hands-on weekend workshop covering full-stack JavaScript development — from REST APIs to deploying production-grade apps.',
    category: 'Workshop',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    venue: 'WeWork Koramangala, Bangalore',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    time: '10:00',
    price: 499,
    totalSeats: 60
  },
  {
    title: 'Stand-Up Comedy Night',
    description: 'An evening of laughter with top comedians performing their best sets live. Doors open 30 minutes before showtime.',
    category: 'Comedy',
    banner: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800',
    venue: 'The Comedy Store, Bangalore',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: '20:00',
    price: 349,
    totalSeats: 80
  },
  {
    title: 'City Marathon 2026',
    description: 'Join thousands of runners in the annual city marathon. Categories for 5K, 10K, and full 42K distances with medals for all finishers.',
    category: 'Sports',
    banner: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
    venue: 'Cubbon Park, Bangalore',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    time: '06:00',
    price: 0,
    totalSeats: 1000
  },
  {
    title: 'Startup Founders Meetup',
    description: 'A casual networking evening for early-stage founders, investors, and product builders. Lightning talks + open networking.',
    category: 'Conference',
    banner: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    venue: 'Indiranagar, Bangalore',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: '17:30',
    price: 0,
    totalSeats: 100
  }
];

async function seed() {
  await connectDB();

  console.log('Clearing existing demo data...');
  await Event.deleteMany({});

  let organizer = await User.findOne({ email: 'organizer@demo.com' });
  if (!organizer) {
    organizer = await User.create({
      name: 'Demo Organizer',
      email: 'organizer@demo.com',
      password: 'password123',
      role: 'organizer'
    });
    console.log('Created demo organizer: organizer@demo.com / password123');
  }

  const eventsWithOrganizer = sampleEvents.map((e) => ({ ...e, organizer: organizer._id }));
  await Event.insertMany(eventsWithOrganizer);

  console.log(`Seeded ${sampleEvents.length} sample events successfully.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
