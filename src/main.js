/* eslint-disable */

// import { createApp } from 'vue'
// import store from './vue/store'
// import router from './vue/router'
// import App from './vue/App.vue'

import './sass/main.scss'

import data from '@/json/data.json'

const regex1 = /^(.{14}\s{2})((?<=.{16}).{28}\s{2})?((?<=.{46}).{14}\s{2})?((?<=.{62}).{9}\s{2})?$/
const regex2 = /^(?:\s{0,2}(.{9})(?=.{62}))?(?:\s{0,2}(.{14})(?=.{46}))?(?:\s{0,2}(.{28})(?=.{16}))?(?:\s{0,2}(.{14}))$/
// const regex3 = /^(?:\s{2,11}(\w{0,9})(?=.{62}))?(?:\s{2,16}(.{0,14})(?=.{46}))?(?:\s{2,30}(.{0,28})(?=.{16}))?(?:\s{2,16}(.{0,14}))(?:\b|$)/gm
const regex4 = /^(?:\s{0,11}(?<name4>\w{0,9})(?=.{62}))?(?:\s{0,16}(?<name3>.{0,14})(?=.{46}))?(?:\s{0,30}(?<name2>.{0,28})(?=.{16}))?(?:\s{0,16}(?<name1>.{0,14}))(?:\b|$)/

const regex5 = /^(?:[N|n]ote|NOTE)\s*\d*?\s*?:\s*(.*)$/
const regex6 = /^(?:[N|n]ote|NOTE)\s*\d*?\s*?:\s*(?<note>.*)$/

String.prototype.reverse = function () {
	return this.split('').reverse().join('');
};

// createApp(App).use(store).use(router).mount('#app')

console.log('leaseschedule ', data)
for( const [i, { leaseschedule }] of data.entries() ) {
	console.log('\n', i, ' leaseschedule > scheduleEntry = ', leaseschedule.scheduleEntry.length)

	const $target = document.getElementById('schedule__notice-of-lease')
	const $li = document.createElement('li')
	const $h2 = document.createElement('h2')
	const $headingLeaseSchedule = document.createTextNode(leaseschedule.scheduleType)

	$li.classList.add('lease__schedule')

	$h2.appendChild($headingLeaseSchedule)
	$li.appendChild($h2)
	$target.appendChild($li)

	leaseschedule.scheduleEntry.forEach( ({ entryText }, j) => {
		// console.log(j, ' ======================= ', entryText)

		if(entryText.length > 1) { //DEVNOTE: entries with a single row are treated as void/cancelled(indiscriminate; requires certified pattern and refinement)

			let result = [[],[],[],[],[]] //new Array(4).fill([])

			entryText.forEach( (row, k) => {
				// console.log(k, ' :: ', row)
				// document.write(JSON.stringify(row, null, 2))

				if(row != null) {

					// DEVNOTE: Because there is no enforcement of content integrity - i.e. sometimes notes break onto two rows. There woud need to be a presumption that rows that follow after the first identifiable occurance of a note will be related content and/or additionals notes.
					let note
					if(regex5.test(row)) {
						// console.log(row)

						note = regex5.exec(row)
						// console.log(note)

						result[4].push(note)
					}else {

						// if(row.endsWith('  ')) {
						// 	// console.log(`${k} ::  ${row}`)

						// 	//NOTE: max row length is 73 characters

						// 	//.match() .matchAll() with regex
						// 	//.slice() return string extract immutable
						// 	//.split()
						// 	//.substring()
						// 	//.substr() //deprecated
						// 	//Symbol.iterator
						// 	/*
						// 	foobar.push(row.substr(0, 16))
						// 	foobar.push(row.substr(16, 30))
						// 	foobar.push(row.substr(16+30, 16))
						// 	foobar.push(row.substr(16+30+16, 11))
						// 	console.log(foobar)
						// 	*/

						// BAD NEWS lookbehinds are not yet supported by javascript
						// var foobar = row.match(regex1)
						// console.log(k, ' :jb: ', foobar)


						var foo = row.reverse()
						// console.log(`\n ${k} --------------------- ${foo.length}`)
						// console.log(foo)
						// console.log(`${k} :foo: ${foo}`)
						var bar = foo.match(regex4)
						// var bar = regex2.exec(foo)
						// console.log(`${k} :bar:`, bar)
						// console.log(bar)

						if(bar) {
							const foobar = bar.map( (item) => item ? item.reverse() : item )
							// console.log(foobar)

							if(foobar[1] && foobar[1].length) result[0].push(foobar[1])
							if(foobar[2] && foobar[2].length) result[1].push(foobar[2])
							if(foobar[3] && foobar[3].length) result[2].push(foobar[3])
							if(foobar[4] && foobar[4].length) result[3].push(foobar[4])

							// console.log(result)
						}

						// }else {

						// 	//note row
						// 	if(row.toLowerCase().startsWith('note')) { //alternative check for presence of double whitespace as this denotes presence of columnar data // probably best to use both
						// 		console.log('note = ', row)
						// 	//incomplete row
						// 	}else {
						// 		console.log(`\n ${k} --------------------- ${row.length}`)
						// 		console.log('incomplete row = ', row);
						// 		var foo = row.reverse().padStart(row.length+2, ' ')
						// 		console.log(foo)
						// 		var bar = regex2.exec(foo)
						// 		console.log(bar)

						// 		//DEVNOTE: TODO. add the two characters of whitespace prefix then it can be passed through the regex like the rest
						// 	}
						// }

						// console.log(foobar[0])
					}

				}
				
			})
			
			// console.log(result)

			const output = {
				column1: result[0].join(' '),
				column2: result[1].join(' '),
				column3: result[2].join(' '),
				column4: result[3].join(' ')
			}

			if(result[4].length) {
				output.note = result[4]
			}

			console.log('============================')
			console.log(output)
			console.log('\n')

			const $article = document.createElement('article')

			$article.classList.add('schedule__entry')

			$li.appendChild($article)
			
			Object.entries(output).forEach( (entry, i) => {

				const $el = document.createElement(i === 0 ? 'h3' : entry[0] === 'note' ? 'ol' :'p')

				if(entry[0] === 'note') {
					const $h4 = document.createElement('h4')
					const $headingNote = document.createTextNode('Notes:')

					$h4.appendChild($headingNote)
					$article.appendChild($h4)

					entry[1].forEach( (note) => {
						console.log(' >> ', note)
						
						const $li = document.createElement('li')

						const $listItemNote = document.createTextNode(note[1])

						$li.appendChild($listItemNote)
						$el.appendChild($li)
					})
				}else {
					$el.innerHTML = entry[1] || 'No information'
				}
				
				$article.appendChild($el)

				// document.write(JSON.stringify(entry[1], null, 2))
			})


		} else {
			// assume entry to be cancelled/void
		}
	})
}
