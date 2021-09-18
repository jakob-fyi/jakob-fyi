$(document).ready(() => {

    if (window.matchMedia('(prefers-color-scheme: dark)').matches)
    {
        $('body').toggleClass(['color-theme--light', 'color-theme--dark']);
    }

    $('.color-theme-toggle').click(() => $('body').toggleClass(['color-theme--light', 'color-theme--dark']));

    _ = new Typed('#greeting-typing', {
        stringsElement: '#greeting',
        typeSpeed: 30,
        onStringTyped: () => setTimeout(() => $('.typed-cursor').remove(), 2000)
    });

    getProjects();
});

const toggleImpressum = () => {

    if ($('.impressum').hasClass('hidden')){
        $('.impressum').show();
        $('.impressum').css({height: 'auto'});
        let h = $('.impressum').height();
        $('.impressum').css({height: '0px'});
        $('.impressum').animate({height: h}, 200, () => $('.impressum').toggleClass(['hidden', 'shown']));
    }else{
        $('.impressum').toggleClass(['hidden', 'shown']);
        setTimeout(() => $('.impressum').animate({height: 0}, 200), 300);
    }
}

const getProjects = () =>
{
    $.get("/projects.json", (projects) =>
    {
        projects.forEach(item => {
            let project = new Project(item);
            let element = project.getElement();
            $("#" + project.category + " > .right > .items").append(element);
        });
    });
}

class Project
{
    started = null;
    ended = null;
    category = null;
    done = false;
    content = null;

    constructor(obj) 
    {
        this.started = obj.started;
        this.ended = obj.ended;
        this.category = obj.category;
        this.done = obj.done;
        this.content = new Content(obj.content);
    }
    
    isLinked = () => this.content.link ? true : false;

    getElement = () => {

        let date = "";
        if (this.started && this.ended) 
        {
            if (this.started == this.ended)
            {
                date = this.started;
            }
            else
            {
                date = this.started + " bis " + this.ended;
            }
        }
        else{
            if (this.finished)
            {
                date = this.started;
            }
            else
            {
                date = `seit ${this.started}`;
            }
        }
        
        let item = $(this.isLinked() ? `<a href="${this.content.link}" target="_blank" class="item item--list"></a>` : `<div class="item item--list">`);

        let left = $(`<div class="item__left">
            <h3 class="item__title">${this.content.title}</h3>
            <p class="item__subtitle">${this.content.susbtitle}</p>
        </div>`);
        
        let right = $(`<div class="item__right">
            <p class="item__date">${date}</p>
        </div>`);

        item.append(left);
        item.append(right);

        return item;
    }
}

class Content
{
    title = null;
    susbtitle = null;
    link = null;

    constructor(obj) 
    {
        this.title = obj.title;
        this.susbtitle = obj.susbtitle;
        this.link = obj.link;
    }
}