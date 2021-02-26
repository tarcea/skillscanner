var firestore = firebase.firestore()

var settings = { timestampsInSnapshots: true};

var userEmail,
    companyName,
    plan

firebase.auth().onAuthStateChanged(function(user) {
    if(user){
        
        window.localStorage.setItem('companyEmail', user.email)

        userEmail = user.email

        firestore.collection('companies').doc(userEmail).onSnapshot(function(doc){
            companyName = doc.data()["company_name"]

            window.localStorage.setItem('companyName', companyName)

            plan = doc.data()["plan"]
        })
    }

    else{
        window.location = "/company-login/c-sign-in-up.html"
    }
})

function hideFilterCategory(){
    $("#job-list-filter-category-dropdown-content").slideUp(250)
}

function toggleFilterCategory(){
    $("#job-list-filter-category-dropdown-content").slideToggle(250)
}

function ChooseFilterJobCategory(category){
    $("#job-list-filter-category-show").text(category)
    hideFilterCategory()

    fetchJobs(window.localStorage.getItem("companyEmail"))
}

function hideFilterCountry(){
    $("#job-list-filter-country-dropdown-content").slideUp(250)
}

function toggleFilterCountry(){
    $("#job-list-filter-country-dropdown-content").slideToggle(250)
}

function ChooseFilterJobCountry(country){
    $("#job-list-filter-country-show").text(country)
    hideFilterCountry()

    fetchJobs(window.localStorage.getItem("companyEmail"))
}

function hideFilterDate(){
    $("#job-list-filter-date-dropdown-content").slideUp(250)
}

function toggleFilterDate(){
    $("#job-list-filter-date-dropdown-content").slideToggle(250)
}

function ChooseFilterJobDate(date){
    $("#job-list-filter-date-show").text(date)
    hideFilterDate()
}


fetchJobs(window.localStorage.getItem("companyEmail"))

function fetchJobs(companyId){
    var currentTimeInMili = new Date().getTime()

    firestore.collection("job_offers").where("companyId", "==", companyId).onSnapshot(function(querySnapshot){
        var numberOfActiveJobs = 0,
            numberOfExpiredJobs = 0
        $("#job-list-content-holder").empty()
        $("#job-list-expired-content-holder").empty()

        querySnapshot.forEach(function(doc){
            var byCategory = $("#job-list-filter-category-show").text(),
                byCountry = $("#job-list-filter-country-show").text(),
                byDate = $("#job-list-filter-date-show").text(),

            jobData = {
                id: doc.id,
                data: doc.data()
            }
            
            var jobDeadlineInMili = new Date(doc.data().expiredAt).getTime()

            if(jobDeadlineInMili - currentTimeInMili >= 0 && (new Date(doc.data().deadline).getTime() > currentTimeInMili)){
                renderJobs(byCategory, byCountry, byDate, jobData)
                numberOfActiveJobs += 1
            }

            else{
                renderExpiredJobs(byCategory, byCountry, byDate, jobData)
                numberOfExpiredJobs += 1
            }

            $("#job-list-active-number").text("Active (" + numberOfActiveJobs + ")")
            $("#job-list-expired-number").text("Expired (" + numberOfExpiredJobs + ")")
        })
    })

    firestore.collection("job_offer_drafts").where("companyId", "==", companyId).onSnapshot(function(querySnapshot){
        var numberOfSavedJobs = 0

        $("#job-list-saved-content-holder").empty()

        querySnapshot.forEach(function(doc){
            var byCategory = $("#job-list-filter-category-show").text(),
                byCountry = $("#job-list-filter-country-show").text(),
                byDate = $("#job-list-filter-date-show").text(),

            jobData = {
                id: doc.id,
                data: doc.data()
            }



            numberOfSavedJobs += 1

            renderSavedJobs(byCategory, byCountry, byDate, jobData)
        })

        $("#job-list-saved-number").text("Saved (" + numberOfSavedJobs + ")")
    })
}

function renderJobs(byCategory, byCountry, byDate, jobData){
    if(jobData.data.category.toLowerCase().trim() === byCategory.toLowerCase().trim() || byCategory.toLowerCase() === "by category" || byCategory.toLowerCase() === "all"){
        if(jobData.data.country.toLowerCase().trim() === byCountry.toLowerCase().trim() || byCountry.toLowerCase() === "by country" || byCountry.toLowerCase() === "all"){
            var cate_tag

            if(jobData.data.category.toLowerCase().indexOf("developer".toLowerCase()) > -1){
                cate_tag = 'IT'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("business".toLowerCase()) > -1){
                cate_tag = 'Business'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("service".toLowerCase()) > -1){
                cate_tag = 'Service'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("market".toLowerCase()) > -1){
                cate_tag = 'Business'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("manage".toLowerCase()) > -1){
                cate_tag = 'Management'
            }
            
            else if(jobData.data.category.toLowerCase().indexOf("sale".toLowerCase()) > -1){
                cate_tag = 'Sales'
            }
    
            else{
                cate_tag = 'Others'
            }

            var jobListContentRow = document.createElement('div')
            jobListContentRow.classList.add("job-list-content-row")

            var jobListContentTitle = document.createElement('div')
            jobListContentTitle.classList.add("job-list-content-title")

            var jobListContentTitleP = document.createElement('p')
            jobListContentTitleP.textContent = jobData.data.title

            jobListContentTitle.appendChild(jobListContentTitleP)
            jobListContentRow.appendChild(jobListContentTitle)

            var jobListContentCategoryTag = document.createElement('div')


            if(cate_tag === "IT" || cate_tag === "Service"){
                jobListContentCategoryTag.classList.add("job-list-content-category-tag-for-IT")
            }

            else if (cate_tag === "Business" || cate_tag === "Management"){
                jobListContentCategoryTag.classList.add("job-list-content-category-tag-for-business")
            }

            else if (cate_tag === "Others" || cate_tag === "Sales"){
                jobListContentCategoryTag.classList.add("job-list-content-category-tag-for-others")
            }

            var jobListContentCategoryTagP = document.createElement('p')
            jobListContentCategoryTagP.textContent = cate_tag

            jobListContentCategoryTag.appendChild(jobListContentCategoryTagP)
            jobListContentRow.appendChild(jobListContentCategoryTag)




            var passingQuery = Qs.stringify({id: jobData.id}),
                passingApplicantsQuery = Qs.stringify({jobId: jobData.id}),
                previewQuery = Qs.stringify({preview: true})

            var daysPassed = parseInt((new Date().getTime() - new Date(jobData.data.createdAt).getTime())/(60 * 60 * 24 * 1000))
            var daysAgoText = ""

            if(daysPassed === 0){
                daysAgoText = "within 24 hours"
            }

            else{
                daysAgoText = daysPassed + " day(s) ago"
            }

            var jobListContentCountryP = document.createElement("p")
            jobListContentCountryP.classList.add("job-list-content-country")
            jobListContentCountryP.textContent = jobData.data.country

            jobListContentRow.appendChild(jobListContentCountryP)

            var mobileJobListPostedTime = document.createElement('div')
            mobileJobListPostedTime.classList.add("mobile-job-list-content-posted-time")

            var mobileJobListPostedTimeIcon = document.createElement('i')
            mobileJobListPostedTimeIcon.classList.add("far")
            mobileJobListPostedTimeIcon.classList.add("fa-clock")
            mobileJobListPostedTime.append(mobileJobListPostedTimeIcon)

            var mobileJobListPostedTimeDaysAgo = document.createElement('p')
            mobileJobListPostedTimeDaysAgo.textContent = daysAgoText
            mobileJobListPostedTime.append(mobileJobListPostedTimeDaysAgo)

            jobListContentRow.appendChild(mobileJobListPostedTime)

            var jobListContentApplicants = document.createElement("div")
            jobListContentApplicants.classList.add("job-list-content-applicants")
            jobListContentApplicants.onclick='window.location="/company-dashboard/applicants-for-job.html?' + passingApplicantsQuery +'"'

            var jobListContentApplicantsIcon = document.createElement("i")
            jobListContentApplicantsIcon.classList.add("fas")
            jobListContentApplicantsIcon.classList.add("fa-users")

            jobListContentApplicants.appendChild(jobListContentApplicantsIcon)

            var jobListContentApplicantsP = document.createElement('p')
            jobListContentApplicantsP.textContent = 'Applicants'

            jobListContentApplicants.appendChild(jobListContentApplicantsP)
            // jobListContentApplicants.append('<div class="job-list-content-applicants-number"><p>2</p></div>')

            jobListContentRow.appendChild(jobListContentApplicants)

            var jobListPostedTime = document.createElement('div')
            jobListPostedTime.classList.add("job-list-content-posted-time")

            var jobListPostedTimeIcon = document.createElement("i")
            jobListPostedTimeIcon.classList.add("far")
            jobListPostedTimeIcon.classList.add("fa-clock")
            jobListPostedTime.appendChild(jobListPostedTimeIcon) 

            var jobListPostedTimeDaysAgo = document.createElement("p")
            jobListPostedTimeDaysAgo.textContent = daysAgoText
            jobListPostedTime.appendChild(jobListPostedTimeDaysAgo)

            jobListContentRow.appendChild(jobListPostedTime)

            var jobListEdit = document.createElement('div')
            jobListEdit.classList.add("job-list-content-edit")
            jobListEdit.onclick= function() {window.open("/company-dashboard/edit-job.html?"+passingQuery)}

            var jobListEditIcon = document.createElement("i")
            jobListEditIcon.classList.add("far")
            jobListEditIcon.classList.add("fa-edit")
            jobListEdit.append(jobListEditIcon)

            var jobListEditP = document.createElement('p')
            jobListEditP.textContent = 'Edit'
            jobListEdit.append(jobListEditP)

            jobListContentRow.appendChild(jobListEdit)

            var jobListContentView = document.createElement('div')
            jobListContentView.classList.add("job-list-content-view")
            jobListContentView.onclick = function() {
                OpenPreview(jobData)
            }

            var jobListContentViewIcon = document.createElement("i")
            jobListContentViewIcon.classList.add("far")
            jobListContentViewIcon.classList.add("fa-eye")
            jobListContentView.append(jobListContentViewIcon)

            var jobListContentViewP = document.createElement('p')
            jobListContentViewP.textContent = 'View'
            jobListContentView.append(jobListContentViewP)

            jobListContentRow.appendChild(jobListContentView)

            var jobListContentDelete = document.createElement('div')
            jobListContentDelete.classList.add("job-list-content-delete")
            jobListContentDelete.onclick = function() { 
                deleteJob(jobData.id , jobData.data.fullPath)
            }


            var jobListContentDeleteIcon = document.createElement("i")
            jobListContentDeleteIcon.classList.add("far")
            jobListContentDeleteIcon.classList.add("fa-trash-alt")
            jobListContentDelete.append(jobListContentDeleteIcon)

            var jobListContentDeleteP = document.createElement('p')
            jobListContentDeleteP.textContent = 'Delete'
            jobListContentDelete.append(jobListContentDeleteP)

            jobListContentRow.appendChild(jobListContentDelete)

            var mobileEditViewDeleteHolder = document.createElement("div")
            mobileEditViewDeleteHolder.classList.add("mobile-edit-view-delete-holder")

            var mobileJobListEdit = document.createElement('div')
            mobileJobListEdit.classList.add("job-list-content-edit")
            mobileJobListEdit.onclick= function() {window.open("/company-dashboard/edit-job.html?"+passingQuery)}

            var mobileJobListEditIcon = document.createElement("i")
            mobileJobListEditIcon.classList.add("far")
            mobileJobListEditIcon.classList.add("fa-edit")
            mobileJobListEdit.append(mobileJobListEditIcon)

            var mobileJobListEditP = document.createElement('p')
            mobileJobListEditP.textContent = 'Edit'
            mobileJobListEdit.append(mobileJobListEditP)

            mobileEditViewDeleteHolder.appendChild(mobileJobListEdit)

            var mobileJobListContentView = document.createElement('div')
            mobileJobListContentView.classList.add("job-list-content-view")
            mobileJobListContentView.onclick = function() {
                OpenPreview(jobData)
            }


            var mobileJobListContentViewIcon = document.createElement("i")
            mobileJobListContentViewIcon.classList.add("far")
            mobileJobListContentViewIcon.classList.add("fa-eye")
            mobileJobListContentView.append(mobileJobListContentViewIcon)

            var mobileJobListContentViewP = document.createElement('p')
            mobileJobListContentViewP.textContent = 'View'
            mobileJobListContentView.append(mobileJobListContentViewP)

            mobileEditViewDeleteHolder.appendChild(mobileJobListContentView)

            var mobileJobListContentDelete = document.createElement('div')
            mobileJobListContentDelete.classList.add("job-list-content-delete")
            mobileJobListContentDelete.onclick = function() { 
                deleteJob(jobData.id , jobData.data.fullPath)
            }

            var mobileJobListContentDeleteIcon = document.createElement("i")
            mobileJobListContentDeleteIcon.classList.add("far")
            mobileJobListContentDeleteIcon.classList.add("fa-trash-alt")
            mobileJobListContentDelete.append(mobileJobListContentDeleteIcon)

            var mobileJobListContentDeleteP = document.createElement('p')
            mobileJobListContentDeleteP.textContent = 'Delete'
            mobileJobListContentDelete.append(mobileJobListContentDeleteP)

            mobileEditViewDeleteHolder.appendChild(mobileJobListContentDelete)


            jobListContentRow.appendChild(mobileEditViewDeleteHolder)

            $("#job-list-content-holder").append(jobListContentRow)
        }
    }
}

function renderSavedJobs(byCategory, byCountry, byDate, jobData){
    if(jobData.data.category.toLowerCase().trim() === byCategory.toLowerCase().trim() || byCategory.toLowerCase() === "by category" || byCategory.toLowerCase() === "all"){
        if(jobData.data.country.toLowerCase().trim() === byCountry.toLowerCase().trim() || byCountry.toLowerCase() === "by country" || byCountry.toLowerCase() === "all"){
            var cate_tag

            if(jobData.data.category.toLowerCase().indexOf("developer".toLowerCase()) > -1){
                cate_tag = 'IT'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("business".toLowerCase()) > -1){
                cate_tag = 'Business'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("service".toLowerCase()) > -1){
                cate_tag = 'Service'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("market".toLowerCase()) > -1){
                cate_tag = 'Business'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("manage".toLowerCase()) > -1){
                cate_tag = 'Management'
            }
            
            else if(jobData.data.category.toLowerCase().indexOf("sale".toLowerCase()) > -1){
                cate_tag = 'Sales'
            }
    
            else{
                cate_tag = 'Others'
            }

            var jobListContentRow = document.createElement('div')
            jobListContentRow.classList.add("job-list-content-row")

            var jobListContentTitle = document.createElement('div')
            jobListContentTitle.classList.add("job-list-content-title")

            var jobListContentTitleP = document.createElement('p')
            jobListContentTitleP.textContent = jobData.data.title

            jobListContentTitle.appendChild(jobListContentTitleP)
            jobListContentRow.appendChild(jobListContentTitle)

            var jobListContentCategoryTag = document.createElement('div')


            if(cate_tag === "IT" || cate_tag === "Service"){
                jobListContentCategoryTag.classList.add("job-list-content-category-tag-for-IT")
            }

            else if (cate_tag === "Business" || cate_tag === "Management"){
                jobListContentCategoryTag.classList.add("job-list-content-category-tag-for-business")
            }

            else if (cate_tag === "Others" || cate_tag === "Sales"){
                jobListContentCategoryTag.classList.add("job-list-content-category-tag-for-others")
            }

            var jobListContentCategoryTagP = document.createElement('p')
            jobListContentCategoryTagP.textContent = cate_tag

            jobListContentCategoryTag.appendChild(jobListContentCategoryTagP)
            jobListContentRow.appendChild(jobListContentCategoryTag)




            var passingQuery = Qs.stringify({id: jobData.id}),
                passingApplicantsQuery = Qs.stringify({jobId: jobData.id})

            var daysPassed = parseInt((new Date().getTime() - new Date(jobData.data.createdAt).getTime())/(60 * 60 * 24 * 1000))
            var daysAgoText = ""

            if(daysPassed === 0){
                daysAgoText = "within 24 hours"
            }

            else{
                daysAgoText = daysPassed + " day(s) ago"
            }

            var jobListContentCountryP = document.createElement("p")
            jobListContentCountryP.classList.add("job-list-content-country")
            jobListContentCountryP.textContent = jobData.data.country

            jobListContentRow.appendChild(jobListContentCountryP)

            var mobileJobListPostedTime = document.createElement('div')
            mobileJobListPostedTime.classList.add("mobile-job-list-content-posted-time")

            var mobileJobListPostedTimeIcon = document.createElement('i')
            mobileJobListPostedTimeIcon.classList.add("far")
            mobileJobListPostedTimeIcon.classList.add("fa-clock")
            mobileJobListPostedTime.append(mobileJobListPostedTimeIcon)

            var mobileJobListPostedTimeDaysAgo = document.createElement('p')
            mobileJobListPostedTimeDaysAgo.textContent = daysAgoText
            mobileJobListPostedTime.append(mobileJobListPostedTimeDaysAgo)

            jobListContentRow.appendChild(mobileJobListPostedTime)

            var jobListContentApplicants = document.createElement("div")
            jobListContentApplicants.classList.add("job-list-content-applicants")
            jobListContentApplicants.onclick='window.location="/company-dashboard/applicants-for-job.html?' + passingApplicantsQuery +'"'

            var jobListContentApplicantsIcon = document.createElement("i")
            jobListContentApplicantsIcon.classList.add("fas")
            jobListContentApplicantsIcon.classList.add("fa-users")

            jobListContentApplicants.appendChild(jobListContentApplicantsIcon)

            var jobListContentApplicantsP = document.createElement('p')
            jobListContentApplicantsP.textContent = 'Applicants'

            jobListContentApplicants.appendChild(jobListContentApplicantsP)
            // jobListContentApplicants.append('<div class="job-list-content-applicants-number"><p>2</p></div>')

            jobListContentRow.appendChild(jobListContentApplicants)

            var jobListPostedTime = document.createElement('div')
            jobListPostedTime.classList.add("job-list-content-posted-time")

            var jobListPostedTimeIcon = document.createElement("i")
            jobListPostedTimeIcon.classList.add("far")
            jobListPostedTimeIcon.classList.add("fa-clock")
            jobListPostedTime.appendChild(jobListPostedTimeIcon) 

            var jobListPostedTimeDaysAgo = document.createElement("p")
            jobListPostedTimeDaysAgo.textContent = daysAgoText
            jobListPostedTime.appendChild(jobListPostedTimeDaysAgo)

            jobListContentRow.appendChild(jobListPostedTime)

            var jobListEdit = document.createElement('div')
            jobListEdit.classList.add("job-list-content-edit")
            jobListEdit.onclick= function() {window.open("/company-dashboard/edit-draft-job.html?"+passingQuery)}

            var jobListEditIcon = document.createElement("i")
            jobListEditIcon.classList.add("far")
            jobListEditIcon.classList.add("fa-edit")
            jobListEdit.append(jobListEditIcon)

            var jobListEditP = document.createElement('p')
            jobListEditP.textContent = 'Edit'
            jobListEdit.append(jobListEditP)

            jobListContentRow.appendChild(jobListEdit)

            var jobListContentView = document.createElement('div')
            jobListContentView.classList.add("job-list-content-view")
            jobListContentView.onclick = function() {
                OpenPreview(jobData)
            }

            var jobListContentViewIcon = document.createElement("i")
            jobListContentViewIcon.classList.add("far")
            jobListContentViewIcon.classList.add("fa-eye")
            jobListContentView.append(jobListContentViewIcon)

            var jobListContentViewP = document.createElement('p')
            jobListContentViewP.textContent = 'View'
            jobListContentView.append(jobListContentViewP)

            jobListContentRow.appendChild(jobListContentView)

            var jobListContentDelete = document.createElement('div')
            jobListContentDelete.classList.add("job-list-content-delete")
            jobListContentDelete.onclick = function() { 
                deleteDraftJob(jobData.id , jobData.data.fullPath)
            }


            var jobListContentDeleteIcon = document.createElement("i")
            jobListContentDeleteIcon.classList.add("far")
            jobListContentDeleteIcon.classList.add("fa-trash-alt")
            jobListContentDelete.append(jobListContentDeleteIcon)

            var jobListContentDeleteP = document.createElement('p')
            jobListContentDeleteP.textContent = 'Delete'
            jobListContentDelete.append(jobListContentDeleteP)

            jobListContentRow.appendChild(jobListContentDelete)

            var mobileEditViewDeleteHolder = document.createElement("div")
            mobileEditViewDeleteHolder.classList.add("mobile-edit-view-delete-holder")

            var mobileJobListEdit = document.createElement('div')
            mobileJobListEdit.classList.add("job-list-content-edit")
            mobileJobListEdit.onclick= function() {window.open("/company-dashboard/edit-draft-job.html?"+passingQuery)}

            var mobileJobListEditIcon = document.createElement("i")
            mobileJobListEditIcon.classList.add("far")
            mobileJobListEditIcon.classList.add("fa-edit")
            mobileJobListEdit.append(mobileJobListEditIcon)

            var mobileJobListEditP = document.createElement('p')
            mobileJobListEditP.textContent = 'Edit'
            mobileJobListEdit.append(mobileJobListEditP)

            mobileEditViewDeleteHolder.appendChild(mobileJobListEdit)

            var mobileJobListContentView = document.createElement('div')
            mobileJobListContentView.classList.add("job-list-content-view")
            mobileJobListContentView.onclick = function() {
                OpenPreview(jobData)
            }


            var mobileJobListContentViewIcon = document.createElement("i")
            mobileJobListContentViewIcon.classList.add("far")
            mobileJobListContentViewIcon.classList.add("fa-eye")
            mobileJobListContentView.append(mobileJobListContentViewIcon)

            var mobileJobListContentViewP = document.createElement('p')
            mobileJobListContentViewP.textContent = 'View'
            mobileJobListContentView.append(mobileJobListContentViewP)

            mobileEditViewDeleteHolder.appendChild(mobileJobListContentView)

            var mobileJobListContentDelete = document.createElement('div')
            mobileJobListContentDelete.classList.add("job-list-content-delete")
            mobileJobListContentDelete.onclick = function() { 
                deleteDraftJob(jobData.id , jobData.data.fullPath)
            }

            var mobileJobListContentDeleteIcon = document.createElement("i")
            mobileJobListContentDeleteIcon.classList.add("far")
            mobileJobListContentDeleteIcon.classList.add("fa-trash-alt")
            mobileJobListContentDelete.append(mobileJobListContentDeleteIcon)

            var mobileJobListContentDeleteP = document.createElement('p')
            mobileJobListContentDeleteP.textContent = 'Delete'
            mobileJobListContentDelete.append(mobileJobListContentDeleteP)

            mobileEditViewDeleteHolder.appendChild(mobileJobListContentDelete)


            jobListContentRow.appendChild(mobileEditViewDeleteHolder)

            $("#job-list-saved-content-holder").append(jobListContentRow)
        }
    }
}

function deleteJob(jobId, fullPath){
    if(confirm("Are you sure to delete " + jobId)){
        firestore.collection("job_offers").doc(jobId).delete().then(function(){
            deleteFromStorage(fullPath)
            .then(function(){
            })
        })
        .catch(function(err){
            console.error("Error removing document: ", err);
        })

        deleteApplicantStorageForJob(jobId, window.localStorage.getItem("companyEmail"))

        deleteApplicantsForJob(jobId, window.localStorage.getItem("companyEmail"))

        fetchJobs(window.localStorage.getItem("companyEmail"))
    }
}

function deleteDraftJob(jobDraftId, fullPath){
    if(confirm("Are you sure to delete " + jobDraftId)){
        firestore.collection("job_offer_drafts").doc(jobDraftId).delete().then(function(){
            deleteFromStorage(fullPath)
            .then(function(){
            })
        })
        .catch(function(err){
            console.error("Error removing document: ", err);
        })

        fetchJobs(window.localStorage.getItem("companyEmail"))
    }
}

function deleteFromStorage(fullPath){
    var storageRef = firebase.storage().ref();

    return storageRef.child(fullPath).delete()
}

function deleteApplicantsForJob(jobId, companyId){
    firestore.collection("job_applicants").where("jobId", "==", jobId).where("companyMail", "==", companyId).get()
    .then(function(querySnapshot){
        var batch = firestore.batch()

        querySnapshot.forEach(function(doc){
            batch.delete(doc.ref)
        })

        return batch.commit()
    })
    .then(function(){
        console.log("deleted documents")
    })
    .catch(function(err){
        console.log(err)
    })
}

function deleteApplicantStorageForJob(jobId, companyId){
    firestore.collection("job_applicants").where("jobId", "==", jobId).where("companyMail", "==", companyId).get().then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
            deleteFromStorage(doc.data().fullPathCv)
            .then(function(){
                deleteFromStorage(doc.data().fullPathCover)
                .then(function(){
                    console.log("deleted storages")
                })
            })
        })
    })
    .catch(function(err){
        console.log(err)
    })
}


function showActiveJobs(){
    $("#job-list-expired-content-holder").removeClass("show-job-list-expired-content-holder")
    $("#job-list-saved-content-holder").removeClass("show-job-list-expired-content-holder")

    $("#job-list-active").removeClass("show-current-job-list-option-chosed")
    $("#job-list-expired").removeClass("show-current-job-list-option-chosed")
    $("#job-list-saved").removeClass("show-current-job-list-option-chosed")

    $("#job-list-active").addClass("show-current-job-list-option-chosed")
}

function showExpiredJobs(){
    $("#job-list-expired-content-holder").removeClass("show-job-list-expired-content-holder")
    $("#job-list-saved-content-holder").removeClass("show-job-list-expired-content-holder")
    $("#job-list-expired-content-holder").addClass("show-job-list-expired-content-holder")

    $("#job-list-active").removeClass("show-current-job-list-option-chosed")
    $("#job-list-expired").removeClass("show-current-job-list-option-chosed")
    $("#job-list-saved").removeClass("show-current-job-list-option-chosed")

    $("#job-list-expired").addClass("show-current-job-list-option-chosed")
}

function showSavedJobs(){
    $("#job-list-expired-content-holder").removeClass("show-job-list-expired-content-holder")
    $("#job-list-saved-content-holder").removeClass("show-job-list-expired-content-holder")
    $("#job-list-saved-content-holder").addClass("show-job-list-expired-content-holder")

    $("#job-list-active").removeClass("show-current-job-list-option-chosed")
    $("#job-list-expired").removeClass("show-current-job-list-option-chosed")
    $("#job-list-saved").removeClass("show-current-job-list-option-chosed")

    $("#job-list-saved").addClass("show-current-job-list-option-chosed")
}

function renderExpiredJobs(byCategory, byCountry, byDate, jobData){
    if(jobData.data.category.toLowerCase().trim() === byCategory.toLowerCase().trim() || byCategory.toLowerCase() === "by category" || byCategory.toLowerCase() === "all"){
        if(jobData.data.country.toLowerCase().trim() === byCountry.toLowerCase().trim() || byCountry.toLowerCase() === "by country" || byCountry.toLowerCase() === "all"){
            var cate_tag

            if(jobData.data.category.toLowerCase().indexOf("developer".toLowerCase()) > -1){
                cate_tag = 'IT'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("business".toLowerCase()) > -1){
                cate_tag = 'Business'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("service".toLowerCase()) > -1){
                cate_tag = 'Service'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("market".toLowerCase()) > -1){
                cate_tag = 'Business'
            }
    
            else if(jobData.data.category.toLowerCase().indexOf("manage".toLowerCase()) > -1){
                cate_tag = 'Management'
            }
            
            else if(jobData.data.category.toLowerCase().indexOf("sale".toLowerCase()) > -1){
                cate_tag = 'Sales'
            }
    
            else{
                cate_tag = 'Others'
            }
            
            var jobListContentRow = document.createElement('div')
            jobListContentRow.classList.add("job-list-content-row")

            var jobListContentTitle = document.createElement('div')
            jobListContentTitle.classList.add("job-list-content-title")

            var jobListContentTitleP = document.createElement('p')
            jobListContentTitleP.textContent = jobData.data.title

            jobListContentTitle.appendChild(jobListContentTitleP)
            jobListContentRow.appendChild(jobListContentTitle)

            var jobListContentCategoryTag = document.createElement('div')


            if(cate_tag === "IT" || cate_tag === "Service"){
                jobListContentCategoryTag.classList.add("job-list-content-category-tag-for-IT")
            }

            else if (cate_tag === "Business" || cate_tag === "Management"){
                jobListContentCategoryTag.classList.add("job-list-content-category-tag-for-business")
            }

            else if (cate_tag === "Others" || cate_tag === "Sales"){
                jobListContentCategoryTag.classList.add("job-list-content-category-tag-for-others")
            }

            var jobListContentCategoryTagP = document.createElement('p')
            jobListContentCategoryTagP.textContent = cate_tag

            jobListContentCategoryTag.appendChild(jobListContentCategoryTagP)
            jobListContentRow.appendChild(jobListContentCategoryTag)




            var passingQuery = Qs.stringify({id: jobData.id}),
                passingApplicantsQuery = Qs.stringify({jobId: jobData.id}),
                previewQuery = Qs.stringify({preview: true})

            var daysPassed = parseInt((new Date().getTime() - new Date(jobData.data.createdAt).getTime())/(60 * 60 * 24 * 1000))
            var daysAgoText = ""

            if(daysPassed === 0){
                daysAgoText = "within 24 hours"
            }

            else{
                daysAgoText = daysPassed + " day(s) ago"
            }

            var jobListContentCountryP = document.createElement("p")
            jobListContentCountryP.classList.add("job-list-content-country")
            jobListContentCountryP.textContent = jobData.data.country

            jobListContentRow.appendChild(jobListContentCountryP)

            var mobileJobListPostedTime = document.createElement('div')
            mobileJobListPostedTime.classList.add("mobile-job-list-content-posted-time")

            var mobileJobListPostedTimeIcon = document.createElement('i')
            mobileJobListPostedTimeIcon.classList.add("far")
            mobileJobListPostedTimeIcon.classList.add("fa-clock")
            mobileJobListPostedTime.append(mobileJobListPostedTimeIcon)

            var mobileJobListPostedTimeDaysAgo = document.createElement('p')
            mobileJobListPostedTimeDaysAgo.textContent = daysAgoText
            mobileJobListPostedTime.append(mobileJobListPostedTimeDaysAgo)

            jobListContentRow.appendChild(mobileJobListPostedTime)

            var jobListContentApplicants = document.createElement("div")
            jobListContentApplicants.classList.add("job-list-content-applicants")
            jobListContentApplicants.onclick='window.location="/company-dashboard/applicants-for-job.html?' + passingApplicantsQuery +'"'

            var jobListContentApplicantsIcon = document.createElement("i")
            jobListContentApplicantsIcon.classList.add("fas")
            jobListContentApplicantsIcon.classList.add("fa-users")

            jobListContentApplicants.appendChild(jobListContentApplicantsIcon)

            var jobListContentApplicantsP = document.createElement('p')
            jobListContentApplicantsP.textContent = 'Applicants'

            jobListContentApplicants.appendChild(jobListContentApplicantsP)
            // jobListContentApplicants.append('<div class="job-list-content-applicants-number"><p>2</p></div>')

            jobListContentRow.appendChild(jobListContentApplicants)

            var jobListPostedTime = document.createElement('div')
            jobListPostedTime.classList.add("job-list-content-posted-time")

            var jobListPostedTimeIcon = document.createElement("i")
            jobListPostedTimeIcon.classList.add("far")
            jobListPostedTimeIcon.classList.add("fa-clock")
            jobListPostedTime.appendChild(jobListPostedTimeIcon) 

            var jobListPostedTimeDaysAgo = document.createElement("p")
            jobListPostedTimeDaysAgo.textContent = daysAgoText
            jobListPostedTime.appendChild(jobListPostedTimeDaysAgo)

            jobListContentRow.appendChild(jobListPostedTime)

            var jobListEdit = document.createElement('div')
            jobListEdit.classList.add("job-list-content-edit")
            jobListEdit.onclick= function() {window.open("/company-dashboard/edit-job.html?"+passingQuery)}

            var jobListEditIcon = document.createElement("i")
            jobListEditIcon.classList.add("far")
            jobListEditIcon.classList.add("fa-edit")
            jobListEdit.append(jobListEditIcon)

            var jobListEditP = document.createElement('p')
            jobListEditP.textContent = 'Edit'
            jobListEdit.append(jobListEditP)

            jobListContentRow.appendChild(jobListEdit)

            var jobListContentView = document.createElement('div')
            jobListContentView.classList.add("job-list-content-view")
            jobListContentView.onclick = function() {
                OpenPreview(jobData)
            }

            var jobListContentViewIcon = document.createElement("i")
            jobListContentViewIcon.classList.add("far")
            jobListContentViewIcon.classList.add("fa-eye")
            jobListContentView.append(jobListContentViewIcon)

            var jobListContentViewP = document.createElement('p')
            jobListContentViewP.textContent = 'View'
            jobListContentView.append(jobListContentViewP)

            jobListContentRow.appendChild(jobListContentView)

            var jobListContentDelete = document.createElement('div')
            jobListContentDelete.classList.add("job-list-content-delete")
            jobListContentDelete.onclick = function() { 
                deleteJob(jobData.id , jobData.data.fullPath)
            }


            var jobListContentDeleteIcon = document.createElement("i")
            jobListContentDeleteIcon.classList.add("far")
            jobListContentDeleteIcon.classList.add("fa-trash-alt")
            jobListContentDelete.append(jobListContentDeleteIcon)

            var jobListContentDeleteP = document.createElement('p')
            jobListContentDeleteP.textContent = 'Delete'
            jobListContentDelete.append(jobListContentDeleteP)

            jobListContentRow.appendChild(jobListContentDelete)

            var mobileEditViewDeleteHolder = document.createElement("div")
            mobileEditViewDeleteHolder.classList.add("mobile-edit-view-delete-holder")

            var mobileJobListEdit = document.createElement('div')
            mobileJobListEdit.classList.add("job-list-content-edit")
            mobileJobListEdit.onclick= function() {window.open("/company-dashboard/edit-job.html?"+passingQuery)}

            var mobileJobListEditIcon = document.createElement("i")
            mobileJobListEditIcon.classList.add("far")
            mobileJobListEditIcon.classList.add("fa-edit")
            mobileJobListEdit.append(mobileJobListEditIcon)

            var mobileJobListEditP = document.createElement('p')
            mobileJobListEditP.textContent = 'Edit'
            mobileJobListEdit.append(mobileJobListEditP)

            mobileEditViewDeleteHolder.appendChild(mobileJobListEdit)

            var mobileJobListContentView = document.createElement('div')
            mobileJobListContentView.classList.add("job-list-content-view")
            mobileJobListContentView.onclick = function() {
                OpenPreview(jobData)
            }


            var mobileJobListContentViewIcon = document.createElement("i")
            mobileJobListContentViewIcon.classList.add("far")
            mobileJobListContentViewIcon.classList.add("fa-eye")
            mobileJobListContentView.append(mobileJobListContentViewIcon)

            var mobileJobListContentViewP = document.createElement('p')
            mobileJobListContentViewP.textContent = 'View'
            mobileJobListContentView.append(mobileJobListContentViewP)

            mobileEditViewDeleteHolder.appendChild(mobileJobListContentView)

            var mobileJobListContentDelete = document.createElement('div')
            mobileJobListContentDelete.classList.add("job-list-content-delete")
            mobileJobListContentDelete.onclick = function() { 
                deleteJob(jobData.id , jobData.data.fullPath)
            }

            var mobileJobListContentDeleteIcon = document.createElement("i")
            mobileJobListContentDeleteIcon.classList.add("far")
            mobileJobListContentDeleteIcon.classList.add("fa-trash-alt")
            mobileJobListContentDelete.append(mobileJobListContentDeleteIcon)

            var mobileJobListContentDeleteP = document.createElement('p')
            mobileJobListContentDeleteP.textContent = 'Delete'
            mobileJobListContentDelete.append(mobileJobListContentDeleteP)

            mobileEditViewDeleteHolder.appendChild(mobileJobListContentDelete)


            jobListContentRow.appendChild(mobileEditViewDeleteHolder)


            $("#job-list-expired-content-holder").append(jobListContentRow)
        }
    }
}

function OpenPreview(jobData){
    $("#fixed-preview-holder").fadeIn()

    $("#preview-job-title").text(jobData.data.title)
    $("#preview-job-company-name").text(jobData.data.companyName)

    $("#preview-job-city").text(jobData.data.city)
    $("#mobile-preview-job-city").text(jobData.data.city)

    $("#preview-job-type").text(jobData.data.position)
    $("#mobile-preview-job-type").text(jobData.data.position)

    $("#preview-job-salary").text(jobData.data.salary)
    $("#mobile-preview-job-salary").text(jobData.data.salary)

    $("#preview-job-deadline").text(jobData.data.deadline)
    $("#mobile-preview-job-deadline").text(jobData.data.deadline)

    $("#preview-job-description-content").empty()
    $("#preview-job-description-content").append(jobData.data.description)

    $("#preview-job-requirement-content").empty()
    $("#preview-job-requirement-content").append(jobData.data.requirement)
}

function ClosePreview(){
    $("#fixed-preview-holder").fadeOut()
}