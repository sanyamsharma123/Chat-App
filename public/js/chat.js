const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormButton = $messageForm.querySelector('button')
const $messageFormInput = $messageForm.querySelector('input')
const $sendLocationButton = document.querySelector('#send-location')
// Select the element in which you want to render the template
const $messages = document.querySelector('#messages')

// Select the template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplete = document.querySelector('#sidebar-template').innerHTML

//Options
const {username , room} = Qs.parse(location.search, { ignoreQueryPrefix:true } )

const autoscroll = () =>{
 //New message element
 const $newMessage = $messages.lastElementChild
  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  // Visible height
  const visibleHeight = $messages.offsetHeight
  // Height of messages container
  const containerHeight = $messages.scrollHeight
  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    //console.log(message)
    const html = Mustache.render(messageTemplate , {
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    // Insert the template into the DOM
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage' , (message) => {
    //console.log(message)
    const html = Mustache.render(locationMessageTemplate , {
        username : message.username,
        url: message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    // Insert the template into the DOM
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData' , ({ room , users}) => {
    const html = Mustache.render(sidebarTemplete , {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disabled
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        //enabled
        $messageFormButton.removeAttribute('disabled')
        // Clear the text from the input
        $messageFormInput.value = ''
        // Shift focus back to the input
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    $messageFormButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
    }, () =>{
        $sendLocationButton.removeAttribute('disabled')
        console.log('Location Shared')
    })
        
    })
})

socket.emit('join' , { username , room }, (error) =>{
  if(error) {
      alert(error)
      location.href = '/'
  }
})
