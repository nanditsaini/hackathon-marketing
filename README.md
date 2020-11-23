# hackathon-marketing

## What does our script do ?

 1. We have prepared a Node Js script which will create the web_research folder automatically for a givent list of websites. This folder will serve as an input to the already being used python script  "FontUseWizard.py" to create the doc
 2. I will first create a list of websites which will be an input to the Node JS script
    - From excel sheet I will find out the unique list of websites
    - Then I will put them into an already existing file "websitesList"
3. After the script runs, a web_research folder will be created and it will have following content in it.
    - A folder for each website 
        - An "images" folder also gets created which will contain the following screenshots
            - websiteTrafic.jpg from the "similarweb.com"
            - fontsList.jpg which contains the list of fonts in the Network Tab
4. After running the Node Js script, I will execute the "FontUseWizard.py" via  PyFontChef and the screenshots will get embedded in the word document automatically

PS: We have also made some changes to the "FontUseWizard.py" as well and we committed those changes in the "FontUseWizard Updated.py" in the "Small Ideas/Challenge 1 - Screenshots of Static Web Pages with the preview of fonts being used, in a word document." folder.

## Prerequisites

Run the following command in terminal to install the dependencies

> npm i

## Commands to run the script 

> node websiteResearch.js "\<output-folder-path\>"

Example:- node websiteResearch.js "../HackathonDemo"

#### Extra feature
- You can also start from a specific website in the websitesList by just sending the line number as shown below

> node websiteResearch.js "../HackathonDemo" --start-from 24

The above command will run the script from 24th website in the "websitesList" file

## Live Demo videos
- Part 1 of 2 - https://drive.google.com/file/d/1PcYDfXK45Qe91dcPNevlFQcwvYx4PzjB/view?usp=sharing
- Part 2 of 2 - https://drive.google.com/file/d/1gfD-mQRCLeV8cq9ZdeOvI6KMnco8b2aJ/view?usp=sharing
- Extra feature - https://drive.google.com/file/d/1nMzviSfXPlS_mQI8UKddcyyUmS8zyjVq/view?usp=sharing