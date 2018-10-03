// Turn off the default Trix captions
Trix.config.attachments.preview.caption = {
  name: false,
  size: false
};

(function() {
    // Adding upload button to Trix toolbar on initialization
    document.addEventListener('trix-initialize', function(e) {
        trix = e.target;
        toolBar = trix.toolbarElement;

        // Creation of the button
        button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("class", "attach");
        button.setAttribute("data-trix-action", "x-attach");
        button.setAttribute("title", "Attach a file");
        button.setAttribute("tabindex", "-1");
        button.innerText = "图片";

        // Attachment of the button to the toolBar
        uploadButton = toolBar.querySelector('.trix-button-group.trix-button-group--block-tools').appendChild(button);

        // When the button is clicked
        uploadButton.addEventListener('click', function() {
            // Create a temporary file input
            fileInput = document.createElement("input");
            fileInput.setAttribute("type", "file");
            fileInput.setAttribute("multiple", "");
            // Add listener on change for this file input
            fileInput.addEventListener("change", function(event) {
                    var file, _i, _len, _ref, _results;
                    _ref = this.files;
                    _results = [];
                    // Getting files
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        file = _ref[_i];
                        // pushing them to Trix
                        _results.push(trix.editor.insertFile(file));
                    }
                    return _results;
                }),
                // Then virtually click on it
                fileInput.click()
        });
        return;
    });
    document.addEventListener('trix-attachment-remove', function(e) {
        // file = e.attachment;
        // Here you could send a request to your app to delete the file
        window.onbeforeunload = function() {};
    });
}).call(this);

function uploadAttachment(attachment) {
  // Create our form data to submit
  var file = attachment.file;
  var form = new FormData;
  form.append("Content-Type", file.type);
  form.append("photo[image]", file);

  // Create our XHR request
  var xhr = new XMLHttpRequest;
  xhr.open("POST", "/photos.json", true);
  xhr.setRequestHeader("X-CSRF-Token", Rails.csrfToken());  // $.rails.csrfToken()   -> When using jquery_ujs instead of rails-ujs.

// Report file uploads back to Trix
  xhr.upload.onprogress = function(event) {
    var progress = event.loaded / event.total * 100;
    attachment.setUploadProgress(progress);
  }

  // Tell Trix what url and href to use on successful upload
  xhr.onload = function() {
    if (xhr.status === 201) {
      var data = JSON.parse(xhr.responseText);
      return attachment.setAttributes({
        url: data.image_url,
        href: data.image_url
      })
    }
  }

  return xhr.send(form);
}

// Listen for the Trix attachment event to trigger upload
document.addEventListener("trix-attachment-add", function(event) {
  var attachment = event.attachment;
  if (attachment.file) {
    return uploadAttachment(attachment);
  }
});
