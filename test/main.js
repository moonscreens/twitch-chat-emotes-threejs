import TwitchChat from "..";
import * as THREE from "three";
import './main.css';


// a default array of twitch channels to join
let channels = ['moonmoon'];

// the following few lines of code will allow you to add ?channels=channel1,channel2,channel3 to the URL in order to override the default array of channels
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});

if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}


const camera = new THREE.PerspectiveCamera(
	70,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 5;


const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);


const ChatInstance = new TwitchChat({
	materialType: THREE.SpriteMaterial,
	materialOptions: {
		transparent: true,
	},
	channels,
	maximumEmoteLimit: 3,
})

const sceneEmoteArray = [];
ChatInstance.listen((emotes) => {
	const group = new THREE.Group();
	group.timestamp = Date.now();
	let i = 0;
	emotes.forEach((emote) => {
		const sprite = new THREE.Sprite(emote.material);
		sprite.position.x = i;
		group.add(sprite);
		i++;
	})
	group.velocity = new THREE.Vector3(
		(Math.random() - 0.5) * 2,
		(Math.random() - 0.5) * 2,
		(Math.random() - 0.5) * 2
	);
	group.velocity.normalize();
	scene.add(group);
	sceneEmoteArray.push(group);
});

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
function init() {
	document.body.appendChild(renderer.domElement);
}

let lastFrame = Date.now();
function draw() {
	if (query_vars.stats) stats.begin();
	requestAnimationFrame(draw);
	const delta = (Date.now() - lastFrame) / 1000;


	for (let index = sceneEmoteArray.length - 1; index >= 0; index--) {
		const element = sceneEmoteArray[index];
		element.position.addScaledVector(element.velocity, delta);
		if (element.timestamp + 5000 < Date.now()) {
			sceneEmoteArray.splice(index, 1);
			scene.remove(element);
		}
	}
	lastFrame = Date.now();

	renderer.render(scene, camera);
	if (query_vars.stats) stats.end();
};

window.addEventListener('DOMContentLoaded', () => {

	window.addEventListener('resize', resize);

	if (query_vars.stats) document.body.appendChild(stats.dom);

	init();
	draw();
})