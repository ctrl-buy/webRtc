const socket = io('/');
const videGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
const peer = {}
myVideo.muted = true;

const newpeer = new Peer(undefined, {
    host: 'https://webrtc-hc2n.onrender.com', // Replace with your domain
    port: 443, // Use 443 for HTTPS
});



navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    addVideoStream(myVideo, stream);

    newpeer.on('call', call => {
        const video = document.createElement('video');
        call.answer(stream);
        call.on('stream', otherUserStream => {
            addVideoStream(video, otherUserStream)
        })
    })


    socket.on('user-connected', userId => {
        setTimeout(() => {
            connectToNewUser(userId, stream)
        }, 1000)
    })

    socket.on('user-disconnect', userId => {
        setTimeout(() => {
            if (peer[userId]) peer[userId].close();
        }, 1000)
    })


}).catch(err => {
    console.error('Failed to get user media:', err);
});

newpeer.on('open', id => {
    socket.emit("join-room", ROOM_ID, id);
})

function connectToNewUser(userId, stream) {
    const call = newpeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStraem => {
        addVideoStream(video, userVideoStraem)
    })
    call.on('close', () => {
        video.remove();
    })
    peer[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videGrid.append(video)
}