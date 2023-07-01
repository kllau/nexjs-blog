Language Dope - Learn languages with lightspeed!

#### Video Demo:  https://youtu.be/5a5x-uZyrLA
#### Description:

This is a web application for studying languages. As a person deeply interested in languages, I wanted to create something that I can use by myself in the future.

The app allows to create new courses, where each course is provided with a title, language pair, and (optionally) short desciption.

On the course page, you can add any number of words that you wish to study in that particular course. Saved words are displayed in the list view, should the user want to revise them. It is possible to remove the words (individually or in a bulk) as well as export the list into CVS file or print it.

The Study module displayes each word's translation on a card. User tries to remember the original word and verifies it by clicking on the card to reveal the answer. User can also use the keyboard to reveal the answer (space) or proceed to the next word (enter). This greatly improves the user experience, there is no need to continuously reach towards the mouse unless it is the user's preferred manner.

In the Practice module, user is asked you to type in the word. Upon submission, the app verifies whether the answer was indeed correct and stores that information. Once the correct answer is perovided at least three times, the word will be automatically stored in the database as studied and removed from the current study cycle. This way, user will not be forced to re-study the same words over and over again. If user wishes to re-study the course words, it is possible to do so with a simple click of the button at the end of the study cycle. Similarly as with Study, user can use the keyboard to submit the answer (enter) and proceed to the next word (space).


#### Technology used:

The app is created using React and Next.js, mostly because it was widely recommended technology and I wanted to try something new.

Most components are used from the MaterialUI library. They are visually pleasant and their usage is quite straightforward.

Supabase was used for storing the data, as it is easy to take into use and integrate with the project. Furthermore, it is available at no additional cost.


#### Content:

App consists of **four pages**: Home page with list of available courses, course page with list of words, Study page with flip cards and Practice page with type-in words.

The app **components** consist of layout used across the app, card component used to generate flip-like cards in the Study module and a wordlist used to list the course words on the course page.

