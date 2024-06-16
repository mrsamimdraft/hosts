function triggerFileInput() {
    document.getElementById('profile_pic_input').click();
}

function previewImage() {
    const file = document.getElementById('profile_pic_input').files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('profile_pic').src = e.target.result;
        document.getElementById('upload_button').style.display = 'inline';
    };
    reader.readAsDataURL(file);
}

function uploadProfilePic() {
    const fileInput = document.getElementById('profile_pic_input');
    if (fileInput.files.length === 0) {
        return;
    }

    const formData = new FormData();
    formData.append('profile_pic', fileInput.files[0]);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'quiz.php?invite=<?php echo $link; ?>', true);

    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            document.getElementById('progress').style.display = 'block';
            document.getElementById('progress_bar').style.width = percentComplete + '%';
        }
    };

    xhr.onloadstart = function() {
        document.getElementById('uploading').style.display = 'inline';
        document.getElementById('uploaded').style.display = 'none';
    };

    xhr.onload = function() {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.status === 'success') {
                document.getElementById('uploaded').style.display = 'inline';
                document.getElementById('uploading').style.display = 'none';
                document.querySelector('.form-container').classList.remove('disabled');
                document.getElementById('upload_button').style.display = 'none';
            }
        }
    };

    xhr.onerror = function() {
        alert('Error uploading file. Please try again.');
    };

    xhr.send(formData);

    document.querySelector('.form-container').classList.add('disabled');
}

function selectOption(question, option) {
    const options = document.querySelectorAll('.option[data-question="' + question + '"]');
    options.forEach(function(opt) {
        opt.classList.remove('selected');
    });

    const selectedOption = document.querySelector('.option[data-question="' + question + '"][data-option="' + option + '"]');
    selectedOption.classList.add('selected');

    document.getElementById('answer').value = option;
}

function validateNext() {
    const selectedOption = document.querySelector('.option.selected[data-question="<?php echo $current_question + 1; ?>"]');
    if (!selectedOption) {
        alert("Please select an option.");
        return false;
    }
    return true;
}

function validateFinish() {
    const selectedOption = document.querySelector('.option.selected[data-question="<?php echo $current_question + 1; ?>"]');
    if (!selectedOption) {
        alert("Please select an option to finish.");
        return false;
    }
    return true;
}
