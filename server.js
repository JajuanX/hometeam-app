if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require("express")
const path = require("path")
const app = express()
const cors = require("cors")
const stripe = require('stripe')('sk_test_51HjT3BHrp1yZiedlQh8QdxBcJ3GLB9DUUL6KwnJXH0J7LMX2o9B2Lh9kVIYG1djnAhhPb7IRAdakgNScrw5ArBWD00cVcMNe77');
var distance = require('google-distance');
distance.apiKey = process.env.GOOGLE_MAPS;
app.use(
	cors({
		origin: "*",
	})
)

// JUST FOR DEMO PURPOSES, PUT YOUR ACTUAL API CODE HERE
// app.get('/api/superhero/:hero', (request,response)=> {
// 	console.log('hit');
// 	axios.get(`https://superheroapi.com/api/${process.env.SUPER_HERO_KEY}/search/${request.params.hero}`)
// 	.then(superHero => response.json(superHero.data.results || []))
// 	.catch( error => response.json({error: "There are no Heroes with that name try again"}))
//   })

app.get('/location/:longitude/:latitude', (request, response) => {
	console.log(request.params.location);
	
	distance.get(
		{
		  index: 1,
		  origin: `${request.params.latitude}, ${request.params.longitude}`,
		  destination: '37.871601,-122.269104'
		},
		function(err, data) {
		  if (err) return console.log(err);
		  console.log(data);
		});
	response.json({
		message: "Hello from server.js",
		key: process.env.GOOGLE_MAPS
	})
})

app.post('/create-checkout-session', async (request, response) => {
	console.log('hit');
	
	// Call your backend to create the Checkout Session
	 stripe.redirectToCheckout({ sessionId: session.id })
	.then(function(result) {
		// If `redirectToCheckout` fails due to a browser or network
		// error, you should display the localized error message to your
		// customer using `error.message`.
		if (result.error) {
		alert(result.error.message);
		}
	})

})


// END DEMO

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')))
  // Handle React routing, return all requests to React app
  app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, 'client/build', 'index.html'))
  })
}

const port = process.env.PORT || 8080
app.listen(
  port,
  () => { console.log(`API listening on port ${port}...`) }
)
