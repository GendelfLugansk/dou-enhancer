import domify from '../../node_modules/domify';
import Alerts from "./alerts";
import sanitizeHtml from '../../node_modules/sanitize-html/dist/sanitize-html';

const TemplatesEditor = function (container, templates, onTemplatesUpdate = () => {
}) {
  if (!(container instanceof Element)) {
    container = document.querySelector(container) || document.body;
  }
  if (!Array.isArray(templates)) {
    throw Error("Templates must be an array");
  }

  this.container = container;
  this.templates = templates;
  this.onTemplatesUpdate = onTemplatesUpdate;

  this.render();
};

TemplatesEditor.prototype.render = function () {
  while (this.container.firstChild) {
    this.container.removeChild(this.container.firstChild);
  }

  const sanitizeOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['u', 'del'])
  };

  this.templates.forEach((template, index) => {
    this.container.appendChild(domify(`<div>
        <div class="uk-card uk-card-default">
<div class="uk-card-body">
<h4 class="uk-card-title">${sanitizeHtml(template.title, sanitizeOptions)}</h4>
<p>${sanitizeHtml(template.content, sanitizeOptions)}</p>
</div>
<div class="uk-card-footer"><button type="button" class="uk-button uk-button-text" btn-role="delete" data-index="${index}"><i class="fa fa-trash-o" aria-hidden="true"></i> Delete</a></div>
</div>
    </div>`));
  });

  this.container.querySelectorAll("button[btn-role]").forEach(button => {
    button.onclick = (e) => {
      const role = e.target.getAttribute("btn-role");
      const templateIndex = e.target.getAttribute("data-index");

      if (role) {
        switch (role) {
          case 'delete':
            this.remove(templateIndex);
            break;
        }
      }
    };
  });

  this.container.appendChild(domify(`<div><div class="uk-card uk-card-default">
<div class="uk-card-body">
<h4 class="uk-card-title">Add your own here</h4>
<p>Click button below to add your own awesome template</p>
</div>
<div class="uk-card-footer">
<button class="uk-button uk-button-text uk-margin-small-right" type="button" uk-toggle="target: #addTemplateModal">
<i class="fa fa-plus" aria-hidden="true"></i> Add</button>
</div>
</div></div>`));

  const modal = document.getElementById("addTemplateModal");

  if (!modal) {
    this.container.appendChild(domify(`<div id="addTemplateModal" uk-modal>
      <div class="uk-modal-dialog">
          <div class="uk-modal-header"><h2 class="uk-modal-title">Add template</h2></div>
          <div class="uk-modal-body">
            <div id="newTemplateAlerts"></div>
            <form>
              <fieldset class="uk-fieldset">        
                  <div class="uk-margin">
                      <input class="uk-input" type="text" placeholder="Title" id="newTemplateTitle">
                  </div>
          
                  <div class="uk-margin">
                      <textarea class="uk-textarea" rows="5" placeholder="Content" id="newTemplateContent"></textarea>
                  </div>        
              </fieldset>
          </form>
          </div>
          <div class="uk-modal-footer">
              <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
              <button class="uk-button uk-button-primary" type="button" id="btnSaveNewTemplate">Save</button>
          </div>
      </div>
    </div>`));

    document.querySelectorAll("#addTemplateModal form").forEach(form => {
      form.onsubmit = () => {
        return false;
      };
    });

    document.getElementById("btnSaveNewTemplate").onclick = () => {
      const titleEl = document.getElementById("newTemplateTitle");
      const contentEl = document.getElementById("newTemplateContent");
      if (!(titleEl && contentEl)) {
        throw new Error("Something is broken, can't find new template form");
      }

      const titleVal = titleEl.value.trim();
      const contentVal = contentEl.value.trim();
      if (titleVal === "" || contentVal === "") {
        this.newTemplateAlerts.failure("Title and content should not be empty");
        return;
      }

      this.add(titleVal, contentVal);
      titleEl.value = "";
      contentEl.value = "";
      /*global UIkit*/
      UIkit.modal(document.getElementById("addTemplateModal")).hide();
    };

    this.newTemplateAlerts = new Alerts('#newTemplateAlerts');
  }
};

TemplatesEditor.prototype.remove = function (indexToRemove) {
  this.templates.splice(indexToRemove, 1);
  this.onTemplatesUpdate();
  this.render();
};

TemplatesEditor.prototype.add = function (title, content) {
  this.templates.push({title, content, description: title});
  this.onTemplatesUpdate();
  this.render();
};

export default TemplatesEditor;
