import TwitchChat from "..";
import "./main.css";
import { Group, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneBufferGeometry, Scene, Sprite, SpriteMaterial, Vector3, WebGLRenderer } from "three";

/*
** connect to twitch chat
*/

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

const ChatInstance = new TwitchChat({
	// If using planes, consider using MeshBasicMaterial instead of SpriteMaterial
	materialType: MeshBasicMaterial,

	// Passed to emote material on creation
	materialOptions: {
		transparent: true,
	},

	channels,
	maximumEmoteLimit: 3,
});

import testImageURL from './test.png';
ChatInstance.addCustomEmote('test', testImageURL);

/*
** Initiate ThreejS scene
*/

const camera = new PerspectiveCamera(
	70,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 5;

const scene = new Scene();
const renderer = new WebGLRenderer({ antialias: false, transparent: true });
renderer.setSize(window.innerWidth, window.innerHeight);

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('resize', resize);
	document.body.appendChild(renderer.domElement);
	draw();
})

/*
** Draw loop
*/
let lastFrame = Date.now();
function draw() {
	requestAnimationFrame(draw);
	const delta = (Date.now() - lastFrame) / 1000;

	for (let index = sceneEmoteArray.length - 1; index >= 0; index--) {
		const element = sceneEmoteArray[index];
		element.position.addScaledVector(element.velocity, delta);
		if (element.timestamp + element.lifespan < Date.now()) {
			sceneEmoteArray.splice(index, 1);
			scene.remove(element);
		} else {
			element.update();
		}
	}
	lastFrame = Date.now();

	renderer.render(scene, camera);
};


/*
** Handle Twitch Chat Emotes
*/
const sceneEmoteArray = [];
const emoteGeometry = new PlaneBufferGeometry(1, 1);
const shadowMaterial = new MeshBasicMaterial({
	color: 0x222222,
})
ChatInstance.listen((emotes) => {
	const group = new Group();
	group.lifespan = 5000;
	group.timestamp = Date.now();

	let i = 0;
	emotes.forEach((emote) => {
		const sprite = new Mesh(emoteGeometry, emote.material);
		sprite.position.x = i;
		group.add(sprite);
		i++;

		const shadow = new Mesh(emoteGeometry, shadowMaterial);
		shadow.position.x = sprite.position.x;
		shadow.position.z = -0.01;
		shadow.scale.setScalar(1.1)
		group.add(shadow);
	})

	// Set velocity to a random normalized value
	group.velocity = new Vector3(
		(Math.random() - 0.5) * 2,
		(Math.random() - 0.5) * 2,
		(Math.random() - 0.5) * 2
	);
	group.velocity.normalize();

	group.update = () => { // called every frame
		let progress = (Date.now() - group.timestamp) / group.lifespan;
		if (progress < 0.25) { // grow to full size in first quarter
			group.scale.setScalar(progress * 4);
		} else if (progress > 0.75) { // shrink to nothing in last quarter
			group.scale.setScalar((1 - progress) * 4);
		} else { // maintain full size in middle
			group.scale.setScalar(1);
		}
	}

	scene.add(group);
	sceneEmoteArray.push(group);
});