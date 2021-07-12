import cookieParser from 'cookie-parser';
import express from 'express';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID =
	'418682635969-scc2hmur1fpk8d7mt3ojg20c4em865ge.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const app = express();

const port = process.env.PORT || 5000;

//Middleware
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', (req, res) => {
	const token = req.body.token;

	async function verify() {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: CLIENT_ID,
		});
		const payload = ticket.getPayload();
		console.log(payload);
	}
	verify()
		.then(() => {
			res.cookie('session-token', token);
			res.send('success');
		})
		.catch(console.error);
});

app.get('/dashboard', checkAuthenticated, (req, res) => {
	let user = req.user;
	res.render('dashboard', { user });
});

app.get('/protectedroute', checkAuthenticated, (req, res) => {
	res.render('protectedroute');
});

app.get('/logout', (req, res) => {
	res.clearCookie('session-token');
	res.redirect('/login');
});

app.listen(port, () => {
	console.log('Server running in http://127.0.0.1:' + port);
});

function checkAuthenticated(req, res, next) {
	let token = req.cookies['session-token'];

	const user = {};

	async function verify() {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: CLIENT_ID,
		});

		const payload = ticket.getPayload();
		user.name = payload.name;
		user.email = payload.email;
		user.picture = payload.picture;
	}
	verify()
		.then(() => {
			req.user = user;
			next();
		})
		.catch((err) => {
			res.redirect('/login');
		});
}
