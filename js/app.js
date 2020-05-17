$(document).ready(() => {

    $('.color-theme-toggle').click(() => {
        $('body').toggleClass(['color-theme--light', 'color-theme--dark']);
    });

    console.debug("ready");

    getProjects();
});

function init ()
{
    console.log("init");
    anime({
        targets: '.item',
        translateX: "500px",
        loop: true,
        duration: 3000
    });
}

function getProjects (category, startIndex, total, inWork = false)
{
    $.get("/projects.json", (projects) =>
    {
        if (inWork == true && category == '*')
        {
            
        }
        console.debug(projects);

        projects.forEach(project => {
            let item = getBuiltItem(project);
            $("#" + project.category + " > .right").append(item);
        });
    });
}

function getBuiltItem(project)
{
    let date = "";
    if (project.started && project.ended) 
    {
        if (project.started == project.ended)
        {
            date = project.started;
        }
        else
        {
            date = project.started + " bis " + project.ended;
        }
    }

    let item = getTemplateItem(project.content.link);
    if (project.content.link) item.attr("href", project.content.link);
    item.children('.item__date').text(date);
    item.children('.item__title').text(project.content.title);
    item.children('.item__subtitle').text(project.content.susbtitle);

    return item;
}

function getTemplateItem(linked)
{
    let itemTag = (linked != false) ? '<a href="" "target="_blank" class="item item--list"></a>' : '<div class="item item--list">';
    let item = $(itemTag);

    item.append('<p class="item__date"></p>');
    item.append('<h3 class="item__title"></h3>');
    item.append('<p class="item__subtitle"></p>');

    return item;
}