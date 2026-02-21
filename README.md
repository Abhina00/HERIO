# Herio 
Team name: <b>HER </b><br>
<br>
Members:
<ul>
  <li>Anjana <br> Bharata Mata College ThrikkakaraK</li>
  <li>Abhina rose shaju<br> Bharata Mata College Thrikkakara</li>
</ul>

<h2>Hosted Project Link</h2>
  https://abhina00.github.io/HerAi2.0/
   
<h2>Project Description</h2>

HER is a web-based AI chatbot designed to support women’s health through intelligent conversations, PCOD risk checking, breast cancer self-assessment guidance, and pregnancy support mode. The platform provides personalized suggestions, reminders, and emotional support through an interactive chat interface.


<h2> The Problem Statement </h2>

Many women lack accessible, private, and continuous health guidance for issues like PCOD, breast health awareness, and pregnancy care. Early symptom detection and consistent tracking are often ignored due to stigma, lack of awareness, or limited resources.

<h2> The Solution </h2>

HER provides a smart AI-driven chatbot platform that:

Offers PCOD symptom analysis

Guides breast self-check awareness

Supports pregnancy monitoring mode

Sends reminders and wellness notifications

Provides emotional support through conversational AI

It acts like a digital companion focused entirely on women’s well-being.


<h2> Technical Details </h2>

<h3>Technologies/Components Used:</h3>

<h3>For Software</h3>
<b>Languages Used:</b>
HTML
CSS
JavaScript

<b>Frameworks Used:</b>
Vanilla JS (No heavy framework – lightweight architecture)

<b>Libraries Used:</b>
Browser LocalStorage API

<b>Tools Used:</b>
VS Code
Git & GitHub
<b>Browser Developer Tools</b>

For Hardware
Not applicable (Web Application)

<h3>Features</h3>
<b>Feature 1: AI Chatbot (Normal Mode)</b>

Conversational AI that provides general health advice, lifestyle suggestions, and emotional support.


<b>Feature 2: Pregnancy Mode</b>

Specialized chat mode that offers trimester-based guidance, nutrition tips, and reminders.


<b>Feature 3: PCOD Checker</b>

Symptom-based questionnaire that evaluates potential PCOD risk and suggests lifestyle remedies.


<b>Feature 4: Breast Health Checker</b>

Guided self-examination instructions and awareness-based assessment tool.


<b>Feature 5: Notification System</b>

Custom reminders for medication, hydration, exercise, and cycle tracking.


<b>Feature 6: Authentication System</b>

Login and signup functionality with user session management.
<h2> Project Structure</h2>


HER/
├── index.html          → Landing page
├── login.html          → User login
├── signup.html         → User registration
├── mode.html           → Mode selection (Normal / Pregnancy)
├── chat.html           → Main AI chat interface
├── pcod-checker.html   → PCOD symptom checker
├── breast-checker.html → Breast health checker
│
├── css/
│   └── style.css       → All styles (responsive, variables, components)
│
└── js/
    ├── config.js       → ⚙️ API key configuration (edit this!)
    ├── auth.js         → Login & signup logic
    ├── main.js         → Landing page interactions
    ├── chat.js         → Core AI chat logic + OpenAI integration
    └── notifications.js → Reminders & notification system
 Project Documentation Screenshots


Chat interface showing AI conversation in Normal Mode.


PCOD symptom assessment form with risk evaluation.


Pregnancy mode with trimester-based recommendations.

 <h2>System Architecture</h2>
<h3></h3>Architecture Overview</h3>
<p>Frontend-Based Architecture</p>
<ol>
    <li>Components:</li>
  <ul>
  <li>UI Layer (HTML + CSS)</li>
  
  <li>Logic Layer (JavaScript files)</li>
  
  <li>Local Storage (User data persistence)</li>
  
  <li>AI API (via config.js integration)</li>
  </ul>
<li><p><strong>Flow:</strong></p></li>
<ul>
<p>User → UI → JS Logic → AI/API → Response → Notification/Recommendation</p></ul>

 <li>Application Workflow</li>
<ul>
<li>User signs up or logs in</li>

<li>Selects chat mode (Normal / Pregnancy)</li>

<li>Interacts with AI chatbot</li>

<li>Can access PCOD or Breast Checker</li>

<li>System evaluates responses</li>

<li>Notifications generated based on stored user data</li>

<li>Personalized suggestions displayed</li>
</ul>
<li>📡 API Documentation</li>
<ul>
(If integrated with AI backend or external API)

<li>Base URL:</li>
https://api.herhealth.com
POST /api/chat

<li>Description:</li>
Processes user message and returns AI response.
</ul>
</ol>
<h3>📈 Future Improvements</h3>
<ul>
<li>Integration with real medical APIs</li>

<li>Secure backend with database (Node.js + MongoDB)</li>

<li>Push notifications</li>

<li>Cycle tracking dashboard</li>

<li>Doctor consultation integration</li>
</ul>
<h3>🏁 Conclusion</h3>
