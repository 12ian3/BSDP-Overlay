let editorOpen = true;
let elementEditor = [];
let selectedElement;
let overlay = [];

window.addEventListener("load", () => { InitaliseEditor(); });

window.onresize = resizeWindowEvent;

function resizeWindowEvent()
{
    let overlayProperties = overlay.el.getBoundingClientRect();
    overlay["width"] = overlayProperties.width;
    overlay["height"] = overlayProperties.height;
}

function InitaliseEditor()
{
    let editorPanel = document.getElementById("editorPanel");
    overlay["el"] = document.getElementById("overlay");
    let moveableElements = document.querySelectorAll(".moveable");

    resizeWindowEvent();

    overlay.el.addEventListener("dblclick", () =>
    {
        if (editorOpen)
        {
            editorPanel.style.width = ".1px";
            setTimeout(() => { editorPanel.style.display = "none"; }, 100);
            moveableElements.forEach(e => { disableDragElement(e); });
        }
        else
        {
            editorPanel.style.display = "table-cell";
            setTimeout(() =>
            {
                editorPanel.style.width = "250px";
                setTimeout(() =>
                {
                    resizeWindowEvent();
                    document.querySelectorAll(".moveable").forEach(e => { dragElement(e); });
                }, 100);
            }, 100);
        }

        editorOpen = !editorOpen;
    });

    document.getElementById("editorElements").querySelectorAll("td").forEach(e =>
    {
        e.ondblclick = function()
        {
            let container = document.createElement("div");
            container.className = "moveable";
            container.style = "left: 45%; top: 45%;";
            container.innerHTML = e.innerHTML;
            overlay.el.appendChild(container);
            dragElement(container);
            UpdateElementEditor(container);
        }
    });

    let elementPosition = document.querySelectorAll(".elementPosition")[0].querySelectorAll("td");
    elementEditor["left"] = elementPosition[1].firstChild;
    elementEditor["right"] = elementPosition[3].firstChild;
    elementEditor["top"] = elementPosition[5].firstChild;
    elementEditor["bottom"] = elementPosition[7].firstChild;
    elementEditor.left.oninput = () => { UpdateElementPosition("left"); };
    elementEditor.right.oninput = () => { UpdateElementPosition("right"); };
    elementEditor.top.oninput = () => { UpdateElementPosition("top"); };
    elementEditor.bottom.oninput = () => { UpdateElementPosition("bottom"); };
    function UpdateElementPosition(toSet)
    {
        let opposite;
        switch(toSet)
        {
            case "left": opposite = "right"; break;
            case "right": opposite = "left"; break;
            case "top": opposite = "bottom"; break;
            default: opposite = "top"; break;
        }

        let bcr = selectedElement.getBoundingClientRect();
        if (elementEditor[toSet].value < 0) { elementEditor[toSet].value = 0; }
        if ((toSet == "left" || toSet == "right") && elementEditor[toSet].value > overlay.width - bcr.width) { elementEditor[toSet].value = overlay.width - bcr.width; }
        if ((toSet == "top" || toSet == "bottom") && elementEditor[toSet].value > overlay.height - bcr.height) { elementEditor[toSet].value = overlay.height - bcr.height; }

        selectedElement.style[opposite] = "unset";
        elementEditor[opposite].value = null;
        selectedElement.style[toSet] = elementEditor[toSet].value + "px";
    }
}

//Heavily modified from https://www.w3schools.com/howto/howto_js_draggable.asp
var elBottom = null, elRight = null;
function dragElement(el)
{
    var xChange = 0, yChange = 0, mouseX = 0, mouseY = 0;
    el.onmousedown = dragMouseDown;

    function dragMouseDown(e)
    {
        UpdateElementEditor(el);
        el.style.left = el.offsetLeft + "px";
        el.style.top = el.offsetTop + "px";
        el.style.right = "unset";
        el.style.bottom = "unset";

        //Get the mouse cursor position at startup:
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.onmouseup = closeDragElement;
        //Call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e)
    {
        //Calculate the new cursor position:
        xChange = - (mouseX - e.clientX);
        yChange = - (mouseY - e.clientY);
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (mouseX > 250 && mouseX - 250 < overlay.width) //Make sure mouse cannot drag elements into the editor panel
        {
            if (mouseX - 250 > overlay.width / 2)
            {
                elementEditor.left.value = null;
                elementEditor.right.value = elRight = offsetRight(el);
            }
            else
            {
                elementEditor.right.value = elRight = null;
                elementEditor.left.value = el.offsetLeft;
            }
            el.style.left = el.offsetLeft + xChange + "px";
        }

        if (mouseY > 0 && mouseY < overlay.height)
        {
            if (mouseY > overlay.height / 2)
            {
                elementEditor.top.value = null;
                elementEditor.bottom.value = elBottom = offsetBottom(el);
            }
            else
            {
                elementEditor.bottom.value = elBottom = null;
                elementEditor.top.value = el.offsetTop;
            }
            el.style.top = el.offsetTop + yChange + "px";
        }
    }
      
    function closeDragElement()
    {
        //Stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;

        if (elRight != null)
        {
            el.style.right = elRight + "px";
            el.style.left = "unset";
        }
        if (elBottom != null)
        {
            el.style.bottom = elBottom + "px";
            el.style.top = "unset";
        }

        UpdateElementEditor(el);
    }
}

function disableDragElement(e) { e.onmousedown = null; }

//Try to make ELEMENT.offsetRight a global function
function UpdateElementEditor(e)
{
    selectedElement = e;

    if (selectedElement.offsetLeft < 0) { selectedElement.style.left = "0px"; }
    else if (offsetRight(selectedElement) < 0) { selectedElement.style.right = "0px"; }
    if (selectedElement.offsetTop < 0) { selectedElement.style.top = "0px"; }
    else if (offsetBottom(selectedElement) < 0) { selectedElement.style.bottom = "0px"; }

    if (elRight == null) { elementEditor.left.value = selectedElement.offsetLeft; }
    else { elementEditor.right.value = offsetRight(selectedElement); }
    if (elBottom == null) { elementEditor.top.value = selectedElement.offsetTop; }
    else { elementEditor.bottom.value = offsetBottom(selectedElement); }
}

function offsetRight(e) { return e.parentElement.getBoundingClientRect().width - (e.offsetLeft + e.getBoundingClientRect().width); }
function offsetBottom(e) { return e.parentElement.getBoundingClientRect().height - (e.offsetTop + e.getBoundingClientRect().height); }