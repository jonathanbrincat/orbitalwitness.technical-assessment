# Orbital Witness Technical Assessment Oct 2021

> *Candidates notes: Standard vue-cli tooling for utility and convenience - not actually using any Vue. Instructions clearly direct it is the approach being assessed and not completeness so I am deferring usage of any obfuscating UI/reactivity libraries to better showcase the raw implementation.*

## Orbital Witness - engineering coding exercise

### Context

At Orbital Witness, we deal with a lot of text content as part of extracting insights from legal documents. One of the biggest challenges we face is the variable (and often poor) data quality in content coming from the original documents. This is especially true for documents that we have to OCR, however it can also be seen in third party data sources that we rely heavily on.

One example of this is for a document type that is provided by the Land Registry, known as Title Registers. Along with the PDFs that our users often review, we are also able to access structured, digitised content through the Land Registry’s API. This exercise concentrates on a specific section of these documents known as the “Schedule of notices of leases” which outlines all of the sub-leases associated with the parent Title. The schedule is set out in a tabular format within the PDF document but is returned in a lossy format through the API so in order to make use of the content, we need to reconstitute the tabular structure.

### The Data

When set out within the document, the Schedule of notices of leases takes the following form:

![Example 1](https://orbitalwitness.pix8.co.uk/ref/example-1.png)

In it, we have 4 columns of content set out:
1. **Registration date and plan ref**​ - This is the date at which the sub lease was
registered with the Land Registry and a qualitative description of how it is
represented on the Title Plan (a separate document)
2. **Property description**​ - Typically the address of the sub lease property
3. **Date of lease and term**​ - The date the lease was executed and the duration of the
lease from that date
4. **Lessee’s title​** - The unique identifier for the sub lease property

Some entries / rows also have one or more “notes” which run across all of the columns:

![Example 2](https://orbitalwitness.pix8.co.uk/ref/example-2.png)

The response back from the API takes the following format (extracted from the wider API response):

![Example 3](https://orbitalwitness.pix8.co.uk/ref/example-3.png)

As you may see, the entryText is an array of strings which reflect the lines of text on the page rather than the cells in the table. The information that is lost as part of this format is that the cell data is delimited by whitespace, however these delimiters aren’t always included for all 4 columns.

The first entry should be structured as so:
1. **Registration date and plan ref**​ - 31.10.2016 1 in yellow
2. **Property description**​ - Retail Warehouse, The Causeway and River Park Avenue,
Staines
3. **Date of lease and term**​ - 25.07.1996 25 years from 25.3.1995
4. **Lessee’s title**​ - SY664660
5. **Note 1**​ - NOTE: The Lease comprises also other land

### The Challenge

Below are links to (1) a JSON document with a number of examples of schedules such as the one above as well as (2) an example Title Register PDF with a particularly long schedule.

1. [https://drive.google.com/file/d/1VcerdKYnvbiVSyuelbiTdU8mzPkYwNdu/view](https://drive.google.com/file/d/1VcerdKYnvbiVSyuelbiTdU8mzPkYwNdu/view)
2. [https://drive.google.com/file/d/1UTiK9DHmXTxl7qm_ba0_hegK8irBch5M/view](https://drive.google.com/file/d/1UTiK9DHmXTxl7qm_ba0_hegK8irBch5M/view)

**Using whatever approach you see fit, prototype a solution for structuring the Schedule of notices of lease data so that the column data and optional notes can be referenced independently. Your solution should use either the JSON or the PDF provided as input but does not need to support both.**

#### Guidelines

+ This exercise is more about approach rather than completeness so, whilst a working example is preferable, comments / documentation of your thinking and considerations going in to the implementation.
+ There will be an opportunity to go into more detail in person as part of the technical interview stage so please aim to spend 2-3 hours for this

---

## Candidate solution commentary

There are two approaches on offer. Attempt to parse the supplied json in blissful ignorance of it's schema and the routine/rules used to grok this from it's source in the first place. Likely to be some edge cases but fingers-crossed there is enough structured format and consistency for me to both interpret and extract meaning. The second option is to start again with the pdf and OCR the lossy/static format with something like [tesseract](https://tesseract.projectnaptha.com/).

As the last time I OCR anything was from hard copies with an A4 scanner back in school and I have no prior experience with this JavaScript OCR library it seemed like the high risk option. There was also the question of how to structure any data captured optically anyway. Felt like a rabbit hole. So choice was easy to make in this respect and stick with the approach I am confident would work within the remit.

The next problem to address was to identify any meaningful patterns within the rows of character data so that the orignal source columanar structure could be delimited and recovered. I deduced from the prevailing evidence of trailing whitespace that it was likely these columns were being strictly enforced by character limits and that is also likely that some whitespace would also be appropiated as a separator. So I began by proofing this theory manually by testing random extracts from the data until eventually I formed a ruleset which seemed to fit the mould.

Armed with a rudimentary pattern to use as a basis for my conversion algorithm - which I could tweek and refine. I now needed a method to execute that algorithm when parsing the json. Again I had reasoned I had two options. One very obvious mechanism was Regular Expressions and the second option was breaking individual rows of strings down using Array methods such as slice or substr(no doubt complemented with the standard built-in String methods too). However both fundamentally involved the same procedure. Seek, extract, resequence and reconstitute. Initially I proofed this concept with Arrays as they are far easier to throw together than Regex and after some positive feedback I paused to reflect. It was obvious that any provisioning using Array methods was effectively a convoluted(and probably inefficient) way of achieving what regex was born to do i.e. it was just manual subsitution for what regex could achieve with a single expression. This convinced me to just bite the bullet and run with regex; only weirdos and sociopaths enjoy regex. 

When I was assessing the data structure to identify patterns I had taken note that the presence of a column in a row was not guaranteed. This meant that any regex pattern would need to be fluid in it's assertions because the structure was not fixed. That meant using lookarounds. I was half aware lookbehinds were potentially not supported by JavaScript(well at least not anything outside Chrome) but this was the fastest way to proof and construct the expression as using a lookahead would require reversing the string being tested and that can get very confusing very fast. So this helped reduced the noise. Once the pattern was well-formed and tested it was converted to a lookahead mimicking a lookbehind.

The strategy for the referencing the optional notes would require an altogether different regex. However as these were singular entries existing within a soliatary row the extraction, resequencing and reconsitution aspects was a lot more straightforward and no lookarounds or reading things backwards. The primary challenge was creating a safe point of entry within these unsorted rows. It was also noted that although the notes always followed after the columnar data of an entry, the strings were not neccesarily all contained within a single row. Sometimes there was overspill. So this would require several assumption to service. That anything existing after the first captured note row is a note entity. And that if it fails the regex test for a row then it will be presumed an orphan to the preceding row and concatenated - although I realise this is not the case as sometimes the orphaned row is actually an independent note, tbh this is not something that can be consolidated without human intervention.
UPDATE: After comparing the supplied PDF to the supplied JSON. It is evident that the json is strewn with inconsistencies and continuity errors. For instance there are way more optional notes in the json and they suffer from stray/orphaned rows that are not exhibited in the pdf.


### Regex was proofed and formed here
[Regex lookbehind](https://regex101.com/r/mZPlFn/1/)

[Regex lookahead(to mimic lookbehind)](https://regex101.com/r/0zUAUp/4/)

[Regex for 'Notes'](https://regex101.com/r/YMmgSs/1/)

---

Node: v14.20.x (will not work with major versions earlier or greater)
NPM: v6.14.x

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
