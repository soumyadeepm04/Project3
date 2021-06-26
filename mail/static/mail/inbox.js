document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#compose-form').onsubmit = function() {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    fetch('/emails', {
      method: 'POST',
      body:JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
    // Print result
      console.log(result);
      load_mailbox('sent');
    })
    return false;
  }
})

document.addEventListener('click', event => {
  document.querySelectorAll('.mailbox-emails').forEach(element => {
    if (element === event.target){
      fetch(`emails/${element.dataset.email}`)
      .then(response => response.json())
      .then(email => {
        document.querySelector('#display-email').innerHTML = `From: ${email.sender} <button onclick = "reply(${email.id})">Reply</button><br>To: ${email.recipients} <br>Subject: ${email.subject} <br>Timestamp: ${email.timestamp} <br>Body: ${email.body}`;
        document.querySelector('#display-email').style.display = 'block';
        document.querySelector('#emails-view').style.display = 'none';
        fetch(`emails/${element.dataset.email}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }) 
    }
  })
})
  

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  if (document.querySelector('#display-email').style.display === 'none'){
  }
  else{
    document.querySelector('#display-email').style.display = 'none';
  }

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  if (document.querySelector('#display-email').style.display === 'none'){
  }
  else{
    document.querySelector('#display-email').style.display = 'none';
  }

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch (`emails/${mailbox}`)
  .then (response => response.json())
  .then (results => {
    console.log(results);
    for (var result in results){ 
      if(results.hasOwnProperty(result)){
        console.log(results[result].subject);
        const element = document.createElement('div');
        if (mailbox === 'inbox'){
          element.innerHTML = `<div data-email = "${results[result].id}" class = "mailbox-emails">From: ${results[result].sender} <button onclick = "archive(${results[result].id})">Archive</button><br>Subject: ${results[result].subject} <br>Timestamp: ${results[result].timestamp}</div>`
        }
        else if(mailbox === 'archive'){
          element.innerHTML = `<div data-email = "${results[result].id}" class = "mailbox-emails">From: ${results[result].sender} <button onclick = "unarchive(${results[result].id})">Unarchive</button><br>Subject: ${results[result].subject} <br>Timestamp: ${results[result].timestamp}</div>`
          console.log('in archive');
        }
        else{
          element.innerHTML = `<div data-email = "${results[result].id}" class = "mailbox-emails">From: ${results[result].sender} <br>Subject: ${results[result].subject} <br>Timestamp: ${results[result].timestamp}</div>`
        }
        if (results[result].read === true){
          element.style.backgroundColor = 'gray';
        }
        else{
          element.style.backgroundColor = 'white';
        }
        
        element.style.borderStyle = 'solid';
        document.querySelector('#emails-view').append(element);
      }
      
    }

  })
}

function archive(id){
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  location.reload();
}

function unarchive(id){
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  location.reload();
}

// function reply(sender, subject, body, timestamp){
//   // Show compose view and hide other views
//   document.querySelector('#emails-view').style.display = 'none';
//   document.querySelector('#compose-view').style.display = 'block';
//   if (document.querySelector('#display-email').style.display === 'none'){
//   }
//   else{
//     document.querySelector('#display-email').style.display = 'none';
//   }

//   // Pre-fill composition fields
//   document.querySelector('#compose-recipients').value = `${sender}`;
//   document.querySelector('#compose-subject').value = `Re: ${subject}`;
//   document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote: ${body}`;
// }

// , email.subject, email.body, email.timestamp

function reply(id){
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  if (document.querySelector('#display-email').style.display === 'none'){
  }
  else{
    document.querySelector('#display-email').style.display = 'none';
  }
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Pre-fill composition fields
    document.querySelector('#compose-recipients').value = `${email.sender}`;
    if (email.subject.includes('Re:')){
      document.querySelector('#compose-subject').value = `${email.subject}`;
    }
    else{
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  })
}