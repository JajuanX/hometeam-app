if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require("express")
const path = require("path")
const app = express()
var distance = require('google-distance');
distance.apiKey = process.env.GOOGLE_MAPS;

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
