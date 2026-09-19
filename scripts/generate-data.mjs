// Generates the fictional "life receipts" dataset with planted story arcs.
// Run: node scripts/generate-data.mjs  →  writes src/data/dataset.json
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const R = []
let n = 0

function add(arc, type, date, time, title, meta = {}, tags = []) {
  n += 1
  R.push({ id: 'r' + String(n).padStart(3, '0'), arc, type, ts: `${date}T${time}:00`, title, meta, tags })
}

/* ---------------- ARC 1 — "The Quiet After" (Jan 6 – Feb 20) -------------- */
add('a1', 'event', '2025-01-06', '21:47', 'The Last Goodbye', { place: 'Platform 2, Egmore Station' }, ['heartbreak', 'turning-point'])
add('a1', 'music', '2025-01-07', '01:52', 'Someone Like You — Adele', { artist: 'Adele', note: 'repeated 11×' }, ['heartbreak', 'late-night'])
add('a1', 'music', '2025-01-07', '02:31', 'Fix You — Coldplay', { artist: 'Coldplay' }, ['heartbreak', 'late-night'])
add('a1', 'search', '2025-01-08', '03:12', '"how to stop thinking about someone"', { engine: 'at 3 AM, apparently' }, ['heartbreak', 'late-night'])
add('a1', 'purchase', '2025-01-09', '20:15', 'Ice cream tub — 1L', { item: 'Belgian chocolate', price: 285, where: 'corner store' }, ['heartbreak'])
add('a1', 'note', '2025-01-11', '23:58', 'day 5. the apartment is too quiet.', { mood: 1 }, ['heartbreak', 'journal'])
add('a1', 'message', '2025-01-12', '13:05', 'from Ananya (sister)', { text: '"eat something. please. i mean it."', contact: 'Ananya' }, ['heartbreak', 'family'])
add('a1', 'movie', '2025-01-14', '23:40', 'Eternal Sunshine of the Spotless Mind', { where: 'couch, alone', rating: '★★★★★' }, ['heartbreak', 'late-night'])
add('a1', 'music', '2025-01-17', '02:04', 'Motion Sickness — Phoebe Bridgers', { artist: 'Phoebe Bridgers' }, ['heartbreak', 'late-night'])
add('a1', 'place', '2025-01-18', '23:58', 'Rooftop, 11:58 PM', { place: 'Home rooftop', dwell: '46 min' }, ['heartbreak'])
add('a1', 'photo', '2025-01-19', '00:12', 'last photo of us — still unarchived', { camera: 'front camera, blurry' }, ['heartbreak'])
add('a1', 'purchase', '2025-01-21', '10:22', 'Tissues ×3 + throat lozenges', { item: 'pharmacy run', price: 164 }, ['heartbreak'])
add('a1', 'search', '2025-01-24', '02:47', '"songs that feel like the end of a movie"', {}, ['heartbreak', 'late-night'])
add('a1', 'music', '2025-01-24', '02:48', 'playlist: lofi for empty rooms', { artist: 'self-curated', note: '18 plays this month' }, ['heartbreak', 'late-night'])
add('a1', 'movie', '2025-02-02', '22:10', 'La La Land (rewatch)', { where: 'couch', rating: '★★★★☆', note: 'cried at the epilogue. again.' }, ['heartbreak'])
add('a1', 'purchase', '2025-02-06', '18:40', 'Blue wall clock', { item: 'replaced the one she left', price: 649 }, ['heartbreak', 'recovery'])
add('a1', 'note', '2025-02-09', '22:31', 'day 34. made coffee for one and it was almost normal.', { mood: 2 }, ['heartbreak', 'journal'])
add('a1', 'search', '2025-02-12', '21:15', '"is it okay to feel better and guilty at the same time"', {}, ['heartbreak'])
add('a1', 'music', '2025-02-15', '08:02', 'Here Comes The Sun — The Beatles', { artist: 'The Beatles', note: 'morning play. a first.' }, ['recovery'])
add('a1', 'event', '2025-02-20', '19:30', 'Gave away the candle she hated', { place: 'charity bin' }, ['recovery', 'turning-point'])

/* ------------- ARC 2 — "Small Rebellions" (Feb 21 – Apr 15) --------------- */
add('a2', 'purchase', '2025-02-21', '17:45', 'Gym membership — 6 months', { item: 'Iron Temple Gym', price: 8999 }, ['fitness', 'turning-point'])
add('a2', 'purchase', '2025-02-23', '12:30', 'Running shoes', { item: 'Decathlon Kiprun', price: 4299 }, ['fitness'])
add('a2', 'search', '2025-02-23', '13:10', '"couch to 5k plan beginner"', {}, ['fitness'])
add('a2', 'place', '2025-02-25', '06:12', 'Cubbon Park loop — 2.1 km', { place: 'Cubbon Park', note: 'walked most of it' }, ['fitness'])
add('a2', 'music', '2025-02-25', '06:10', 'playlist: RUN OR DIE', { artist: 'self-curated' }, ['fitness'])
add('a2', 'message', '2025-02-27', '08:40', 'to Vikram', { text: '"bro i ran (jogged) (barely) 2.5km today"', contact: 'Vikram' }, ['fitness', 'friendship'])
add('a2', 'purchase', '2025-03-02', '18:20', 'Whey protein — 1kg', { item: 'chocolate flavour, objectively mid', price: 2499 }, ['fitness'])
add('a2', 'search', '2025-03-04', '22:35', '"why does running hurt so much at first"', {}, ['fitness'])
add('a2', 'photo', '2025-03-09', '06:25', 'first sunrise run', { camera: 'rear, 0.5×' }, ['fitness'])
add('a2', 'place', '2025-03-09', '06:20', 'Cubbon Park loop — 4.0 km', { place: 'Cubbon Park' }, ['fitness'])
add('a2', 'note', '2025-03-12', '21:02', 'sleep schedule fixed itself. nobody told me exercise does that.', { mood: 4 }, ['fitness', 'journal'])
add('a2', 'music', '2025-03-16', '06:08', 'Stronger — Kanye West', { artist: 'Kanye West' }, ['fitness'])
add('a2', 'purchase', '2025-03-19', '19:55', 'Skipping rope + yoga mat', { item: 'the basics, finally', price: 598 }, ['fitness'])
add('a2', 'event', '2025-03-23', '07:02', 'First 5K without stopping', { place: 'Cubbon Park' }, ['fitness', 'turning-point'])
add('a2', 'photo', '2025-03-23', '07:14', 'post-run face: dying but alive', { camera: 'selfie' }, ['fitness'])
add('a2', 'message', '2025-03-23', '09:00', 'to Vikram', { text: '"5KM. WHOLE THING. who is this person"', contact: 'Vikram' }, ['fitness', 'friendship'])
add('a2', 'search', '2025-03-28', '21:30', '"protein timing myth or real"', {}, ['fitness'])
add('a2', 'note', '2025-04-05', '08:15', 'weigh-in: −4 kg since February. the quiet had a purpose.', { mood: 4 }, ['fitness', 'journal'])
add('a2', 'place', '2025-04-12', '06:18', 'Cubbon Park loop — 6.3 km', { place: 'Cubbon Park', note: 'personal distance record' }, ['fitness'])

/* ---------- ARC 3 — "The Interview Gauntlet" (Apr 16 – May 30) ------------ */
add('a3', 'search', '2025-04-16', '22:44', '"frontend interview questions 2025"', {}, ['career'])
add('a3', 'purchase', '2025-04-18', '09:30', 'Cold brew — small', { item: 'Blue Tokai', price: 95, note: 'first of ~14' }, ['career'])
add('a3', 'place', '2025-04-18', '09:35', 'Blue Tokai — revision spot', { place: 'Blue Tokai Coffee', dwell: '2h 40m' }, ['career'])
add('a3', 'music', '2025-04-20', '10:05', 'Golden — Harry Styles', { artist: 'Harry Styles', note: 'pre-interview hype ritual' }, ['career'])
add('a3', 'event', '2025-04-22', '11:00', 'Interview #1 — disaster (own the lowlight)', { place: 'Google Meet' }, ['career'])
add('a3', 'note', '2025-04-22', '23:19', 'fumbled a question i KNOW. shake it off. next.', { mood: 2 }, ['career', 'journal'])
add('a3', 'search', '2025-04-24', '23:50', '"system design basics for frontend devs"', {}, ['career', 'late-night'])
add('a3', 'movie', '2025-04-27', '22:50', 'The Social Network (again)', { where: 'laptop', rating: '★★★★☆', note: 'unhealthy motivation source' }, ['career'])
add('a3', 'purchase', '2025-05-02', '09:35', 'Cold brew — small', { item: 'Blue Tokai', price: 95 }, ['career'])
add('a3', 'place', '2025-05-02', '09:40', 'Blue Tokai — revision spot', { place: 'Blue Tokai Coffee', dwell: '3h 05m' }, ['career'])
add('a3', 'search', '2025-05-05', '20:12', '"how to resign politely without burning bridges"', {}, ['career'])
add('a3', 'event', '2025-05-08', '15:00', 'Interview #2 — the one that felt right', { place: 'Office, 4th floor' }, ['career'])
add('a3', 'message', '2025-05-09', '10:41', 'from Vikram', { text: '"DID YOU SEE THE EMAIL. OPEN THE EMAIL"', contact: 'Vikram' }, ['career', 'friendship'])
add('a3', 'event', '2025-05-21', '12:30', 'Offer Letter Day', { place: 'inbox, 12:30 PM' }, ['career', 'turning-point'])
add('a3', 'message', '2025-05-21', '13:02', 'to Mom', { text: '"Amma. i got the job. the scary one."', contact: 'Mom' }, ['career', 'family'])
add('a3', 'purchase', '2025-05-24', '20:45', 'Mechanical keyboard (celebration tax)', { item: 'brown switches, too loud', price: 5999 }, ['career'])
add('a3', 'note', '2025-05-26', '22:58', 'two offers. pick the scary one. always pick the scary one.', { mood: 5 }, ['career', 'journal'])
add('a3', 'search', '2025-05-28', '11:20', '"things to do before moving to bangalore"', {}, ['career', 'newcity'])

/* ------------- ARC 4 — "Salt Air & Scooters" (Jun 5 – Jun 12) ------------- */
add('a4', 'event', '2025-06-05', '06:40', 'Goa Trip Begins', { place: 'BLR → GOI, 6 AM flight' }, ['travel', 'turning-point'])
add('a4', 'message', '2025-06-04', '22:10', 'Goa Gang 🏖', { text: '"flight at 6am. NO ONE be late. i mean you, karan."', contact: 'Goa Gang' }, ['travel', 'friendship'])
add('a4', 'place', '2025-06-05', '11:30', 'Baga Beach — first salt air', { place: 'Baga Beach' }, ['travel'])
add('a4', 'music', '2025-06-05', '17:00', 'playlist: ocean drive', { artist: 'self-curated' }, ['travel'])
add('a4', 'purchase', '2025-06-05', '19:20', 'Scooter rental — 3 days', { item: 'pink activa, dents included', price: 1500 }, ['travel'])
add('a4', 'photo', '2025-06-05', '18:44', 'sunset at Thalassa', { camera: 'rear, HDR' }, ['travel'])
add('a4', 'place', '2025-06-06', '10:15', 'Anjuna flea market', { place: 'Anjuna' }, ['travel'])
add('a4', 'purchase', '2025-06-06', '10:52', 'Flip-flops', { item: 'immediate necessity', price: 399 }, ['travel'])
add('a4', 'purchase', '2025-06-06', '10:58', 'Sunscreen SPF 50', { item: 'learned this the hard way', price: 540 }, ['travel'])
add('a4', 'photo', '2025-06-06', '16:30', 'accidental masterpiece of Vikram mid-sneeze', { camera: 'burst mode' }, ['travel', 'friendship'])
add('a4', 'place', '2025-06-07', '17:45', 'Thalassa sunset point', { place: 'Vagator', dwell: '2h 10m' }, ['travel'])
add('a4', 'purchase', '2025-06-07', '20:30', 'Beach shack dinner ×4', { item: 'grilled fish + stories', price: 2800 }, ['travel', 'friendship'])
add('a4', 'music', '2025-06-08', '11:20', 'Kun Faya Kun — A.R. Rahman', { artist: 'A.R. Rahman', note: 'full car sing-along' }, ['travel'])
add('a4', 'search', '2025-06-08', '23:30', '"things to do in goa at night"', {}, ['travel', 'late-night'])
add('a4', 'photo', '2025-06-09', '15:05', 'scooter gang (self-timer, someone always blinks)', { camera: 'propped on helmet' }, ['travel', 'friendship'])
add('a4', 'place', '2025-06-10', '09:00', 'Candolim — quiet morning walk', { place: 'Candolim Beach' }, ['travel'])
add('a4', 'event', '2025-06-12', '21:15', 'Goa Trip Ends (airport simgiri)', { place: 'GOI airport' }, ['travel'])

/* -------- ARC 5 — "New City, New Frequency" (Jul 1 – Jul 20) --------- */
add('a5', 'search', '2025-07-01', '08:40', '"PG near Indiranagar under 15k"', {}, ['newcity'])
add('a5', 'purchase', '2025-07-02', '14:30', 'Mattress — the first adult purchase', { item: 'ortho something-or-other', price: 8499 }, ['newcity'])
add('a5', 'event', '2025-07-03', '17:00', 'New apartment — keys!', { place: 'Indiranagar, 2nd floor walkup' }, ['newcity', 'turning-point'])
add('a5', 'photo', '2025-07-03', '17:20', 'empty room, one suitcase', { camera: 'rear, wide' }, ['newcity'])
add('a5', 'purchase', '2025-07-04', '11:15', 'Study lamp', { item: 'warm white, non-negotiable', price: 1199 }, ['newcity'])
add('a5', 'purchase', '2025-07-04', '11:40', 'Electric kettle', { item: 'survival equipment', price: 949 }, ['newcity'])
add('a5', 'message', '2025-07-05', '21:30', 'from Mom', { text: '"did you eat? call me after work. every day. not negotiable."', contact: 'Mom' }, ['newcity', 'family'])
add('a5', 'search', '2025-07-05', '09:10', '"bangalore metro map for humans"', {}, ['newcity'])
add('a5', 'event', '2025-07-07', '09:00', 'First Day at New Job', { place: '4th floor, seat 4C — window!' }, ['newcity', 'turning-point'])
add('a5', 'place', '2025-07-07', '08:20', 'Indiranagar metro — new commute', { place: 'Indiranagar Metro' }, ['newcity'])
add('a5', 'music', '2025-07-07', '08:25', 'playlist: city of stars (commute vol. 1)', { artist: 'self-curated' }, ['newcity'])
add('a5', 'purchase', '2025-07-09', '18:50', 'Auto fares ×8 — getting lost fund', { item: 'city tuition fees', price: 2100 }, ['newcity'])
add('a5', 'place', '2025-07-11', '16:40', 'Third Wave Coffee — new regular spot', { place: 'Third Wave Coffee', dwell: '1h 15m' }, ['newcity'])
add('a5', 'note', '2025-07-12', '23:40', 'everything smells new here. even the rain is a different rain.', { mood: 4 }, ['newcity', 'journal', 'late-night'])
add('a5', 'photo', '2025-07-13', '18:55', 'first balcony sunset', { camera: 'rear' }, ['newcity'])
add('a5', 'search', '2025-07-15', '21:05', '"how to make friends in a new city as an adult"', {}, ['newcity'])
add('a5', 'music', '2025-07-17', '08:30', 'Kannada radio roulette', { artist: 'FM 93.5', note: 'guessing games with the auto driver' }, ['newcity'])
add('a5', 'event', '2025-07-19', '20:00', 'First team dinner — survived', { place: 'Toit, Indiranagar' }, ['newcity', 'friendship'])

/* ----- ARC 6 — "Two Straws, One Milkshake" (Aug 8 – Sep 30) ----- */
add('a6', 'event', '2025-08-08', '19:30', 'The Day We Met (Priya\'s birthday)', { place: 'Priya\'s terrace' }, ['love', 'turning-point'])
add('a6', 'message', '2025-08-09', '00:40', 'from Meera', { text: '"you told the same story twice. i let you. it was funny twice."', contact: 'Meera' }, ['love', 'late-night'])
add('a6', 'message', '2025-08-12', '14:22', 'to Meera', { text: '"coffee? there\'s a place. it\'s mid. but i\'ll talk less this time"', contact: 'Meera' }, ['love'])
add('a6', 'place', '2025-08-12', '17:05', 'Corner House — first ice cream', { place: 'Corner House' }, ['love'])
add('a6', 'purchase', '2025-08-12', '17:02', 'Milkshake ×2 (two straws)', { item: 'death by chocolate, obviously', price: 360 }, ['love'])
add('a6', 'movie', '2025-08-16', '19:45', 'Before Sunrise (her pick)', { where: 'PVR, row F', rating: '★★★★★', note: 'she quoted it from memory' }, ['love'])
add('a6', 'music', '2025-08-19', '22:30', 'Put Your Head On My Shoulder — Paul Anka', { artist: 'Paul Anka', note: 'she sent it. on loop since.' }, ['love'])
add('a6', 'place', '2025-08-24', '17:40', 'Cubbon Park — the bench', { place: 'Cubbon Park', note: 'bench 14. it\'s ours now.' }, ['love'])
add('a6', 'photo', '2025-08-24', '17:48', 'her stealing my fries', { camera: 'rear, motion blur' }, ['love'])
add('a6', 'purchase', '2025-08-30', '20:15', 'Two cinema tickets ×3rd weekend running', { item: 'a pattern, knowingly continued', price: 880 }, ['love'])
add('a6', 'movie', '2025-09-06', '21:00', 'Inception (my pick, she slept)', { where: 'home projector', rating: '★★★★☆', note: 'she says it\'s "a long movie". it IS not.' }, ['love'])
add('a6', 'message', '2025-09-14', '23:55', 'from Meera', { text: '"you left your scarf at the bench. it\'s mine now."', contact: 'Meera' }, ['love', 'late-night'])
add('a6', 'music', '2025-09-15', '18:00', 'playlist: the duet list (we keep adding to it)', { artist: 'co-curated', note: '47 songs, 2 owners' }, ['love'])
add('a6', 'purchase', '2025-09-21', '16:30', 'Her favourite book — wrapped', { item: 'no occasion. any excuse.', price: 499 }, ['love'])
add('a6', 'note', '2025-09-27', '22:41', 'she laughs at my worst jokes. this is dangerous.', { mood: 5 }, ['love', 'journal', 'late-night'])
add('a6', 'photo', '2025-09-28', '18:20', 'the bench, golden hour, no fries left', { camera: 'rear' }, ['love'])

/* -------------- ARC 7 — "Six Strings" (Sep 21 – Nov 18) --------------- */
add('a7', 'purchase', '2025-09-21', '12:10', 'Acoustic guitar', { item: 'Yamaha F280', price: 6499, note: 'the impulse that stuck' }, ['guitar', 'turning-point'])
add('a7', 'purchase', '2025-09-21', '12:35', 'Capo + picks (×6, will lose 5)', { item: 'starter kit', price: 420 }, ['guitar'])
add('a7', 'search', '2025-09-22', '20:30', '"guitar chords for absolute beginners"', {}, ['guitar'])
add('a7', 'note', '2025-09-25', '21:15', 'day 5. fingers hurt. it hurts so good.', { mood: 4 }, ['guitar', 'journal'])
add('a7', 'music', '2025-09-28', '09:40', 'Wonderwall — Oasis', { artist: 'Oasis', note: 'i know. EVERYONE knows.' }, ['guitar'])
add('a7', 'search', '2025-10-03', '21:50', '"how to stop guitar fingers hurting (fast)"', {}, ['guitar'])
add('a7', 'photo', '2025-10-10', '20:02', 'blistered fingers, proud grin', { camera: 'selfie' }, ['guitar'])
add('a7', 'music', '2025-10-18', '10:00', 'Blackbird — The Beatles', { artist: 'The Beatles', note: 'the goal. unreachable for now.' }, ['guitar'])
add('a7', 'note', '2025-10-25', '21:40', 'barre chords: defeated at attempt 40-something. UNDEFEATED no more.', { mood: 4 }, ['guitar', 'journal'])
add('a7', 'search', '2025-11-01', '19:25', '"wonderwall chords without capo"', {}, ['guitar'])
add('a7', 'event', '2025-11-02', '18:30', 'First full song, start to finish, no stopping', { place: 'the window, evening light' }, ['guitar', 'turning-point'])
add('a7', 'message', '2025-11-02', '19:10', 'to Meera', { text: '"guess who learned your favourite song. fine. wonderwall. FINE. blackbird next."', contact: 'Meera' }, ['guitar', 'love'])
add('a7', 'purchase', '2025-11-08', '15:20', 'Guitar stand', { item: 'it has a home now. we have a home.', price: 799 }, ['guitar'])
add('a7', 'photo', '2025-11-15', '17:35', 'guitar by the window, 6 pm light', { camera: 'rear' }, ['guitar'])
add('a7', 'music', '2025-11-18', '21:00', 'Nothing Else Matters — Metallica', { artist: 'Metallica', note: 'slow, ugly, and entirely mine' }, ['guitar'])

/* ---------- ARC 8 — "The Long Way Home" (Nov 19 – Dec 31) ---------- */
add('a8', 'purchase', '2025-11-19', '10:00', 'Train ticket home', { item: 'side lower, window seat', price: 1450 }, ['family'])
add('a8', 'purchase', '2025-11-19', '18:30', 'Shawl for Amma', { item: "blue-grey, she'll say it's too expensive", price: 1899 }, ['family', 'love'])
add('a8', 'event', '2025-11-20', '06:30', 'Diwali at Home — train back', { place: 'KSR Bengaluru → Chennai' }, ['family', 'turning-point'])
add('a8', 'place', '2025-11-20', '16:45', 'Home — the old street', { place: 'Anna Nagar, Chennai' }, ['family'])
add('a8', 'message', '2025-11-20', '17:02', 'from Mom', { text: '"your room is exactly how you left it. i dusted it. exactly."', contact: 'Mom' }, ['family'])
add('a8', 'photo', '2025-11-20', '19:30', "Amma's rangoli — champion, 22nd year running", { camera: 'rear' }, ['family'])
add('a8', 'event', '2025-11-21', '05:00', 'Terrace fireworks, 5 AM crowd', { place: 'home terrace' }, ['family'])
add('a8', 'music', '2025-11-21', '06:10', "Kishore Kumar — terrace edition", { artist: 'Kishore Kumar', note: "Dad's speaker, Dad's rules" }, ['family'])
add('a8', 'movie', '2025-11-22', '21:00', 'K3G — family tradition', { where: 'living room', rating: '★★★★★', note: 'no protests entertained.' }, ['family'])
add('a8', 'purchase', '2025-11-23', '11:20', 'Sweets box ×2', { item: 'one for home, one "for the road" (for me)', price: 1100 }, ['family'])
add('a8', 'photo', '2025-11-23', '17:40', 'the whole chaos of us — one frame', { camera: 'tripod, timer, chaos' }, ['family'])
add('a8', 'event', '2025-11-24', '09:15', 'Back to Bangalore (with 2kg of laddus)', { place: 'train, returning' }, ['family'])
add('a8', 'note', '2025-12-01', '22:20', 'home keeps your room exactly the same so you can keep changing.', { mood: 5 }, ['family', 'journal', 'late-night'])
add('a8', 'search', '2025-12-08', '22:35', '"new year resolutions that actually stick"', {}, ['reflection', 'late-night'])
add('a8', 'note', '2025-12-15', '23:05', 'this year broke me and built me. mostly built. 10/10 would live again.', { mood: 5 }, ['reflection', 'journal', 'late-night'])
add('a8', 'music', '2025-12-28', '23:40', 'playlist: the year in sound (2025)', { artist: 'self-curated', note: '97 songs. every one a receipt.' }, ['reflection', 'late-night'])
add('a8', 'event', '2025-12-31', '23:59', 'Year ends. story continues.', { place: 'rooftop, Meera + Vikram + the cold' }, ['reflection', 'love', 'friendship', 'turning-point'])

/* ------------------- Ambient filler receipts (everyday life) ------------------- */
const fillers = [
  ['a1', 'purchase', '2025-01-15', '13:20', 'Food delivery — biryani for one', { item: 'ambur star, extra raita', price: 410 }, ['comfort']],
  ['a1', 'search', '2025-01-19', '02:30', '"why do we dream about people who leave"', {}, ['heartbreak', 'late-night']],
  ['a1', 'music', '2025-02-03', '02:15', 'The Night We Met — Lord Huron', { artist: 'Lord Huron' }, ['heartbreak', 'late-night']],
  ['a2', 'purchase', '2025-03-08', '19:45', 'Gym shaker bottle + gloves', { item: 'becoming a whole stereotype', price: 540 }, ['fitness']],
  ['a2', 'search', '2025-04-01', '21:15', '"can you run in the rain, shoes wet"', {}, ['fitness']],
  ['a2', 'music', '2025-04-10', '06:05', 'Till I Collapse — Eminem', { artist: 'Eminem' }, ['fitness']],
  ['a3', 'purchase', '2025-04-26', '09:32', 'Cold brew — small', { item: 'Blue Tokai', price: 95 }, ['career']],
  ['a3', 'message', '2025-05-14', '16:45', 'from Vikram', { text: '"resume? again? send it. last version had \'lead\' twice"', contact: 'Vikram' }, ['career', 'friendship']],
  ['a3', 'place', '2025-05-15', '09:38', 'Blue Tokai — revision spot', { place: 'Blue Tokai Coffee', dwell: '2h 50m' }, ['career']],
  ['a4', 'search', '2025-06-06', '22:40', '"is beach water safe at night goa"', {}, ['travel', 'late-night']],
  ['a4', 'purchase', '2025-06-09', '13:15', 'Coconut water ×2', { item: 'beach price, beach memory', price: 120 }, ['travel']],
  ['a5', 'purchase', '2025-07-16', '20:10', 'Dinner — new place, solo mission', { item: 'chettinad, table for one', price: 380 }, ['newcity']],
  ['a5', 'photo', '2025-07-20', '07:55', 'the commute, a beautiful morning', { camera: 'rear' }, ['newcity']],
  ['a5', 'note', '2025-07-19', '23:30', 'learned the metro. went the wrong direction once. (twice.)', { mood: 3 }, ['newcity', 'journal', 'late-night']],
  ['a6', 'purchase', '2025-08-23', '18:50', 'Popcorn (large) + two seats', { item: 'her: salt. me: caramel. compromise pending', price: 520 }, ['love']],
  ['a6', 'music', '2025-09-08', '23:15', 'Made You Look — Meghan Trainor', { artist: 'Meghan Trainor', note: 'her kitchen-dance fault' }, ['love', 'late-night']],
  ['a6', 'search', '2025-09-18', '21:40', '"gift ideas for someone who hates gifts"', {}, ['love']],
  ['a7', 'purchase', '2025-10-05', '16:45', 'Spare strings + winder', { item: 'broke the high E. day 15. we move.', price: 640 }, ['guitar']],
  ['a7', 'search', '2025-10-12', '20:55', '"is 30 too late to learn guitar (asking for me)"', {}, ['guitar']],
  ['a7', 'note', '2025-11-10', '21:50', 'wrote 4 bars of something. it\'s nothing. it\'s everything.', { mood: 5 }, ['guitar', 'journal', 'late-night']],
  ['a8', 'purchase', '2025-12-05', '19:30', 'Blanket upgrade — winter edition', { item: 'bangalore winters demand respect', price: 1299 }, ['everyday']],
  ['a8', 'music', '2025-12-20', '18:45', 'Christmas-in-Bangalore playlist', { artist: 'cafe speakers, everywhere' }, ['everyday']],
  ['a8', 'photo', '2025-12-29', '18:50', 'the bench, winter light, coffee for two', { camera: 'rear' }, ['love']],
]
for (const [arc, type, date, time, title, meta, tags] of fillers) add(arc, type, date, time, title, meta, tags)

/* ------------------------------ Write out ------------------------------ */
R.sort((a, b) => a.ts.localeCompare(b.ts))
R.forEach((r, i) => { r.id = 'r' + String(i + 1).padStart(3, '0') })

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
writeFileSync(join(outDir, 'dataset.json'), JSON.stringify(R, null, 1))
console.log(`✔ wrote ${R.length} receipts to src/data/dataset.json`)





