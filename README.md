# orbitalwitness_technical-test

Standard vue-cli tooling for utility and convenience - not actually using any Vue.

## Commentary

There are two approaches on offer. Attempt to parse the supplied json in blissful ignorance of it's schema and the routine/rules used to grok this from it's source in the first place. Likely to be some edge cases but fingers-crossed there is enough structured format and consistency for me to both interpret and extract meaning. The second option is to start again with the pdf and OCR the lossy/static format with (tesseract)[https://tesseract.projectnaptha.com/].

As the last time I OCR anything was from hard copies with an A4 scanner back in school and I have no prior experience with this JavaScript OCR library it seemed like the high risk option. There was also the question of how to structure any data captured optically anyway. Felt like a rabbit hole. So choice was easy to make in this respect and stick with the approach I am confifent would work within the remit.

The next problem to address was to identify any meaningful patterns within the rows of character data so that the orignal source columanar structure could be delimited and recovered. I deduced from the prevailing evidence of trailing whitespace that it was likely these columns were being strictly enforced by character limits and that is also likely that some whitespace would also be appropiated as a separator. So I began by proofing this theory manually by testing random extracts from the data until eventually I formed a ruleset which seemed to fit the mould.

Armed with a rudimentary pattern to use as a basis for my conversion algorithm - which I could tweek and refine. I now needed a method to execute that algorithm when parsing the json. Again I had reasoned I had two options. One very obvious mechanism was Regular Expressions and the second option was breaking individual rows of strings down using Array methods such as slice or substr(no doubt complemented with the standard built-in String methods too). However both fundamentally involved the same procedure. Seek, extract, sequence and reconstitute. Initially I proofed this concept with Arrays as they are far easier to throw together than Regex and after some positive feedback I paused to reflect. It was obvious that any provisioning using Array methods was effectively a convoluted(and probably inefficient) way of achieving what regex was born to do i.e. it was just manual subsitution for what regex could achieve with a single expression. This convinced me to just bite the bullet and run with regex; only weirdos and sociopaths enjoy regex. 

When I was assessing the data structure to identify patterns I had taken note that the presence of a column in a row was not guaranteed. This meant that any regex pattern would need to be fluid in it's assertions because the structure was not fixed. That meant using lookarounds. I was half aware lookbehinds were potentially not supported by JavaScript(well at least not anything outside Chrome) but this was the fastest way to proof and construct the expression as using a lookahead would require reversing the string being tested and that can get very confusing very fast. So this helped reduced the noise. Once the pattern was well-formed and tested it was converted to a lookahead mimicking a lookbehind.

The strategy for the referencing the optional notes would require a different different regex. However as these were singular entries existing within a soliatary row the extraction, sequencing and reconsitution aspects were a lot more straightforward. The primary challenge was creating a safe point of entry in these rows. It was also noted that although the notes always followed after the columnar data, the strings were not neccesarily all contained within a single row. Sometimes there was overspill. So this would require several assumption to service. That anything existing after the first captured note row is a note entity. And that if it fails the regex test for a row then it will be presumed an orphan to the preceding row and concatenated.

###Regex was proofed and formed here
[Regex lookbehind](https://regex101.com/r/mZPlFn/1/)
[Regex lookahead(to mimic lookbehind)](https://regex101.com/r/0zUAUp/4/)
[Regex for 'Notes'](https://regex101.com/r/YMmgSs/1/)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm start
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
