import { process } from '/env'
import { Configuration, OpenAIApi } from 'openai'

const setupInputContainer = document.getElementById('setup-input-container')
const movieBossText = document.getElementById('movie-boss-text')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

document.getElementById("send-btn").addEventListener("click", () => {
  const setupTextarea = document.getElementById('setup-textarea')
  if (setupTextarea.value) {
    const userInput = setupTextarea.value
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`
    fetchBotReply(userInput)
    fetchSynopsis(userInput)
  }
})

async function fetchBotReply(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a short message to enthusiastically say an outline sounds interesting and that you need some minutes to think about it.
    ###
    outline: Two dogs fall in love and move to Hawaii to learn to surf.
    message: I'll need to think about that. But your idea is amazing! I love the bit about Hawaii!
    ###
    outline:A plane crashes in the jungle and the passengers have to walk 1000km to safety.
    message: I'll spend a few moments considering that. But I love your idea!! A disaster movie in the jungle!
    ###
    outline: A group of corrupt lawyers try to send an innocent woman to jail.
    message: Wow that is awesome! Corrupt lawyers, huh? Give me a few moments to think!
    ###
    outline: ${outline}
    message: 
    `,
    max_tokens: 60
  })
  movieBossText.innerText = response.data.choices[0].text.trim()
}

async function fetchSynopsis(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate an engaging, professional and marketable murder mystery synopsis based on an outline.  
    ###
    outline: strangers stuck in a mansion where a murder has taken place
    synopsis:  In a secluded mansion nestled on the outskirts of a remote village, strangers with mysterious pasts find themselves in a mansion entwined in a deadly game of psychological suspense. As a torrential storm rages outside, they must confront their own demons and uncover the chilling truth behind a series of murders that seem to have originated within their own ranks.
    ###
    outline: ${outline}
    synopsis: 
    `,
    max_tokens: 700
  })
  const synopsis = response.data.choices[0].text.trim()
  document.getElementById('output-text').innerText = synopsis
  fetchTitle(synopsis)
  // fetchStars(synopsis)
}

async function fetchTitle(synopsis) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a catchy title for this synopsis: ${synopsis}`,
    max_tokens: 25,
    temperature: 1
  })
  const title = response.data.choices[0].text.trim()
  document.getElementById('output-title').innerText = title
  fetchImagePromt(title, synopsis)
}

// async function fetchStars(synopsis) {
//   const response = await openai.createCompletion({
//     model: 'text-davinci-003',
//     prompt: `Extract the names in brackets from the synopsis.
//     ###
//     synopsis: In a secluded mansion nestled on the outskirts of a remote village, three strangers with mysterious pasts find themselves entwined in a deadly game of psychological suspense. As a torrential storm rages outside, they must confront their own demons and uncover the chilling truth behind a series of murders that seem to have originated within their own ranks.
// In a heart-stopping climax, the storm outside mirrors the tempest within the mansion as the final confrontation ensues. The three strangers must confront the darkness that has been lurking in their midst and uncover the shocking motives behind the murders. "Echoes of Deceit" is a riveting psychological thriller that delves into the darkest corners of the human psyche, revealing that sometimes the most dangerous enemy is the one within.

//     names: Tom Cruise, Val Kilmer, Kelly McGillis
//     ###
//     synopsis: ${synopsis}
//     names:   
//     `,
//     max_tokens: 30
//   })
//   document.getElementById('output-stars').innerText = response.data.choices[0].text.trim()
// }

async function fetchImagePromt(title, synopsis) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Give a short description of an image which could be used to advertise a movie based on a title and synopsis. The description should be rich in visual detail but contain no names.
    ###
    title: Echos of Deceit
    synopsis: In a secluded mansion nestled on the outskirts of a remote village, strangers with mysterious pasts find themselves entwined in a deadly game of psychological suspense. As a torrential storm rages outside, they must confront their own demons and uncover the chilling truth behind a series of murders that seem to have originated within their own ranks.
    image description: A vast, sun-drenched desert landscape stretches out as far as the eye can see. The ground is a tapestry of rust-red sand and rocky outcrops, with the occasional hardy desert plant struggling to survive in the harsh environment. The sky is a brilliant azure, with a few wispy clouds lazily drifting by.
    ###
    title: Shadows Over Eldoria
    synopsis: In the realm of Eldoria, a land of magic and mythical creatures, a dark and sinister plot unfolds. A powerful Archmage is found brutally murdered in his arcane tower, leaving the realm in a state of shock and fear. As the sun sets over the ancient city, a diverse group of adventurers find themselves drawn into a web of intrigue and danger, tasked with uncovering the truth behind the Archmage's death. 
    image description: The image depicts a towering, ancient arcane tower rising from the heart of a dense, enchanted forest. The tower is an architectural marvel, its structure a seamless blend of natural elements and mystical craftsmanship. Intricate runes and glyphs carved into the tower's stone exterior shimmer with an ethereal light, casting an enchanting glow on the surrounding trees.
    ###
    title: ${title}
    synopsis: ${synopsis}
    image description: 
    `,
    temperature: 0.8,
    max_tokens: 100
  })
  fetchImageUrl(response.data.choices[0].text.trim())
}

async function fetchImageUrl(imagePrompt) {
  const response = await openai.createImage({
    prompt: `${imagePrompt}. There should be no text in this image.`,
    n: 1,
    size: '256x256',
    response_format: 'url'
  })
  document.getElementById('output-img-container').innerHTML = `<img src="${response.data.data[0].url}">`
  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
  document.getElementById('view-pitch-btn').addEventListener('click', () => {
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'
    movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
  })
}