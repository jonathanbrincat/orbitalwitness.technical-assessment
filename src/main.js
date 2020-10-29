/* eslint-disable */

// import { createApp } from 'vue'
// import store from './vue/store'
// import router from './vue/router'
// import App from './vue/App.vue'

// createApp(App).use(store).use(router).mount('#app')

import './sass/main.scss'

import data from '@/json/data.json'

String.prototype.reverse = function () {
	return this.split('').reverse().join('');
};

const regexEntry = /^(?:\s{0,11}(?<registration>\w{0,9})(?=.{62}))?(?:\s{0,16}(?<description>.{0,14})(?=.{46}))?(?:\s{0,30}(?<term>.{0,28})(?=.{16}))?(?:\s{0,16}(?<title>.{0,14}))(?:\b|$)/
const regexNotes = /^(?:[N|n]ote|NOTE)\s*\d*?\s*?:\s*(?<note>.*)$/


for( const [i, { leaseschedule }] of data.entries() ) {

	//DEVNOTE: rendering to page - START
	const $target = document.getElementById('schedule__notice-of-lease')
	const $li = document.createElement('li')
	const $h2 = document.createElement('h2')
	const $headingLeaseSchedule = document.createTextNode(leaseschedule.scheduleType)

	$li.classList.add('lease__schedule')
	$h2.classList.add('schedule__heading')

	$h2.appendChild($headingLeaseSchedule)
	$li.appendChild($h2)
	$target.appendChild($li)
	//DEVNOTE: rendering to page - END

	leaseschedule.scheduleEntry.forEach( ({ entryText }, j) => {

		if(entryText.length > 1) { //DEVNOTE: entries with a single row are treated as void/cancelled(indiscriminate; requires certified pattern and refinement)

			const entryColumns = [[],[],[],[],[]]

			// Check if our entry has any optional notes. If it does we split into two separate pieces so we can deal with them individually - this is necessary because I found some notes have orphaned rows of text
			const hasNotes = entryText.findIndex( (row) => regexNotes.test(row) )
			if(hasNotes !== -1) {
				var entryArray = entryText.slice(0, hasNotes)
				var notesArray = entryText.slice(hasNotes)
			}else {
				var entryArray = entryText.slice()
			}

			// Parse our rows of text for entries and partition into their columnar segments
			entryArray && entryArray.forEach( (row, k) => {
				if(row !== null) {

					// JavaScript does not currently support the lookbehind feature with regex - however we can mimic a positive lookbehind with a lookahead by reversing our string and the regex pattern to suit
					const lookupSegments = row.reverse().match(regexEntry)

					if(lookupSegments) {
						const entrySegments = lookupSegments.map( (segment) => segment ? segment.reverse() : segment )

						// Sequence our captive segments so they are represented collectively in columnar order
						let index = 1
						while(index < entrySegments.length) {
							if(entrySegments[index] && entrySegments[index].length) entryColumns[index-1].push(entrySegments[index])
							
							index++
						}
					}
				}
			})

			// Parse our optional notes. Capture and concatenate any stray/orphaned rows
			notesArray && notesArray.forEach( (row, l) => {
				if(row !== null) {
					if(regexNotes.test(row)) {
						const note = regexNotes.exec(row)

						entryColumns[4].push(note[1])
					} else {
						// DEVNOTE: Concatenation orphans to previous note
						entryColumns[4][entryColumns[4].length-1] = `${entryColumns[4][entryColumns[4].length-1]} ${row}`
						
						// DEVNOTE: Make orphans additional note entries
						// entryColumns[4].push(row)
					}
				}
			})
			
			// Flatten our arrays now grouped by column/category by concatenating the pieces we've collected together into a reunited and coherent string
			const data = {
				title: entryColumns[0].join(' '),
				term: entryColumns[1].join(' '),
				description: entryColumns[2].join(' '),
				registration: entryColumns[3].join(' ')
			}

			if(entryColumns[4].length) {
				data.note = entryColumns[4]
			}

			//DEVNOTE: if this where an endpoint then yes we could go one step further here and create a json collection using .map() instead of .forEach()

			//DEVNOTE: rendering to page - START
			const $article = document.createElement('article')
			const $table = document.createElement('table')

			$table.classList.add('entry__table')

			$article.classList.add('schedule__entry')

			$li.appendChild($article)
			$article.appendChild($table)
			
			Object.entries(data).forEach( (entry, m) => {
				const $el = document.createElement(m === 0 ? 'h3' : 'ol')

				if(entry[0] === 'note') {
					const $h4 = document.createElement('h4')
					const $headingNote = document.createTextNode('Notes:')

					$h4.classList.add('entry__notes-heading')
					$el.classList.add('entry__notes-list')

					$h4.appendChild($headingNote)
					$article.appendChild($h4)

					entry[1].forEach( (note) => {						
						const $li = document.createElement('li')
						$li.classList.add('notes-list__item')

						const $listItemNote = document.createTextNode(note)

						$li.appendChild($listItemNote)
						$el.appendChild($li)
					})

					$article.appendChild($el)

				}else {
					if(m > 0) {
						const $el = document.createElement('td')
						const $tr = document.createElement('tr')
						const $th = document.createElement('th')

						$tr.classList.add(`entry__${entry[0]}`)

						$th.innerHTML = entry[0]
						$el.innerHTML = entry[1] || 'No information'

						$tr.appendChild($th)
						$tr.appendChild($el)
						$table.appendChild($tr)

					}else {
						$el.classList.add(`entry__${entry[0]}`)
						$el.innerHTML = entry[1] || 'No information'

						$article.prepend($el)
					}

				}
				
				// document.write(JSON.stringify(entry[1], null, 2))
				//DEVNOTE: rendering to page - END
			})


		} else {
			// DEVNOTE: assume entry to be cancelled/void
		}
	})
}
