import Typed from 'typed.js';
import { Project } from './models.js';
import * as projects from '../../data/projects.json';

window.toggleTheme = () => {
    document.body.classList.toggle('color-theme--light');
    document.body.classList.toggle('color-theme--dark');
}

window.toggleImpressum = () => {
    document.querySelector('.impressum').classList.toggle('hidden');
}

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    window.toggleTheme();
}

projects.forEach(item => {
    let project = new Project(item);
    let element = project.getElement();
    document.querySelector("#" + project.category + " > .right > .items").appendChild(element);
});

const _ = new Typed('#greeting-typing', {
    stringsElement: '#greeting',
    typeSpeed: 30,
    onStringTyped: () => setTimeout(() => document.querySelector('.typed-cursor').remove(), 2000)
});