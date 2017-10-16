
var jsforce = require('jsforce');
var fs = require('fs');

// Load configuration from the file
const sfdconfig = fs.readFileSync('./sfdcConfig.json');

// read json object
const config = JSON.parse(sfdconfig);

function runThis(){

    var conn = new jsforce.Connection({
        // you can change loginUrl to connect to sandbox or prerelease env.
        loginUrl : config.webServer.url_test
        //loginUrl : 'https://login.salesforce.com'
    });

    var username = config.webServer.username_test;
    var password = config.webServer.password_test;

    conn.login(username, password, function(err, userInfo) {
        if (err) { return console.error(err); }
        // Now you can get the access token and instance URL information.
        // Save them to establish connection next time.
        /*
	console.log(conn.accessToken);
    console.log(conn.instanceUrl);
    // logged in user property
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);
    console.log( userInfo);

    console.log('JSForce Connect Successed!');
	*/




        //selectQuery(conn);

        //insertSingleRecord(conn);

        //bulkInsert(conn);

        //bulkInsertContact(conn);
        //insertMultipleRecords(conn);
        //console.log('upsert!!');
        //upsertSingleRecord(conn);
        uploadImage(conn);

        //uploadSetImage(conn);
        //executeSql(connection);

        // Here ends the login block
    });

}

runThis();

function selectQuery(conn){
    // Perform a Select Query

    conn.query("SELECT Name FROM Account", function(err, result) {
        if (err) { return console.log("z"+err); }
        // print the result

        console.log(result.totalSize);
        totalSize=result.totalSize;
        console.log("fetched : " + result.records.length);


        // Convert result to json object
        var json = JSON.stringify(result);
        //console.log(json);
    });
}

/**
 Photo upload module
 **/

function uploadImage(conn){
    var fileOnServer = 'images/chris_work_profile.jpg',
        fileName = 'chris_work_profile.jpg',
        fileType = 'image/jpeg';

    fs.readFile(fileOnServer, function(err,filedata){
        if(err){
            console.log(err);
        }
        else{
            var base64Data = new Buffer(filedata).toString('base64');
            conn.sobject('Attachment').create({
                ParentId: config.webServer.my_parent_id,
                Name: fileName,
                Body: base64Data,
                ContentType: fileType
            },function(err,uploadedAttachment){
                console.log(err,uploadedAttachment);
                queryAttachmentId(conn)
            });
        }
    });
}

function queryAttachmentId(conn){
    var myid ='';
    // Get the Attachment
    conn.query("SELECT Id FROM Attachment WHERE ParentID='0033D00000LK8VVQA1'", function(err, result) {
        if (err) { return console.log("z"+err); }
        // print the result

        //console.log(result.totalSize);
        //totalSize=result.totalSize;
        //console.log("fetched : " + result.records.length);


        // Convert result to json object
        var json = JSON.stringify(result);
        //console.log(result.records[0].Id);
        myid = result.records[0].Id;
        setProfilePic(conn,myid);
        console.log(myid);
    });
}

function setProfilePic(conn,imgId){
    var url = 'https://c.cs70.content.force.com/servlet/servlet.FileDownload?file='+imgId;
    var srcUrl = '<img alt="User-added image" src="'+ url +'"></img>';
    console.log(srcUrl);
    conn.sobject("Contact").upsert(
        {
            EmplID__c: config.webServer.my_emplid,
            LastName: 'Lagali',
            FirstName: 'Chris',
            hed__UniversityEmail__c: 'christopher.lagali@csueastbay.edu',
            Phone : config.webServer.my_phone,
            ProfilePicURL__c: srcUrl
        },'EmplID__c', function(err, ret) {
            if (err || !ret.success) { return console.error(err, ret); }
            console.log("Upserted Successfully !!");
        });
}

function insertSingleRecord(conn){
    // Single record creation

    /*conn.sobject("Account").create({ Name : 'Chris AC', RecordTypeId : '0121I000000cO3T', Email__c : 'christopher.lagali@csueastbay.edu', Phone : config.webServer.my_phone, Chair_Associate_Chair__c : 'true'}, function(err, ret) {
		if (err || !ret.success) { return console.error(err, ret); }
		console.log("Created record id : " + ret.id);
	});
	*/

    conn.sobject("Contact").create({ Id: config.webServer.my_emplid,EmplID__c: config.webServer.my_emplid,LastName: 'Lagali',FirstName: 'Christopher',hed__UniversityEmail__c: 'christopher.lagali@csueastbay.edu', Phone : config.webServer.my_phone}, function(err, ret) {
        if (err || !ret.success) { return console.error(err, ret); }
        console.log("Created record id : " + ret.id);
    });
}


function upsertSingleRecord(conn){
    // Single record creation

    /*conn.sobject("Account").create({ Name : 'Chris AC', RecordTypeId : '0121I000000cO3T', Email__c : 'christopher.lagali@csueastbay.edu', Phone : config.webServer.my_phone, Chair_Associate_Chair__c : 'true'}, function(err, ret) {
		if (err || !ret.success) { return console.error(err, ret); }
		console.log("Created record id : " + ret.id);
	});
	*/
    var url = '/services/images/photo/'+'00P3D000000ix4nUAA';
    conn.sobject("Contact").upsert(
        {
            EmplID__c: config.webServer.my_emplid,
            LastName: 'Lagali',
            FirstName: 'Chris',
            hed__UniversityEmail__c: 'christopher.lagali@csueastbay.edu',
            Phone : config.webServer.my_phone,
            PhotoUrl: url
        },'EmplID__c', function(err, ret) {
            if (err || !ret.success) { return console.error(err, ret); }
            console.log("Upserted Successfully !!");
        });
}

// bulk operations


function bulkUpsert(conn){

    //Bulk API to insert
    var accounts = [

    ];

    conn.sobject("Contact").upsert();
    //Create job and batch
    var job = conn.bulk.createJob("Contact","insert");
    var batch = job.createBatch();
    //start Job
    batch.execute(contacts);

    //listen for events
    // fired when batch request is queued in server.
    batch.on("error",function(batchInfo){
        console.log('Error,batchInfo ',batchInfo);
    });
    // start polling - Do not poll until the batch has started
    batch.on("queue",function(batchInfo){
        console.log('Queue' + batchInfo );
        batch.poll(1000 , 20000);
    });
    // fired when batch finished and result retrieved
    batch.on("response", function(rets) {
        for (var i=0; i < rets.length; i++) {
            if (rets[i].success) {
                console.log("#" + (i+1) + " loaded successfully, id = " + rets[i].id);
            } else {
                console.log("#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', '));
            }
        }
    });
}



function bulkInsert(conn,res){

    //Bulk API to insert
    var accounts = [

    ];
    //Create job and batch
    var job = conn.bulk.createJob("Account","insert");
    var batch = job.createBatch();
    //start Job
    batch.execute(accounts);

    //listen for events
    // fired when batch request is queued in server.
    batch.on("error",function(batchInfo){
        console.log('Error,batchInfo ',batchInfo);
    });
    // start polling - Do not poll until the batch has started
    batch.on("queue",function(batchInfo){
        res.status('Queue,batchInfo ').send(batchInfo);
        batch.poll(1000 , 20000);
    });
    // fired when batch finished and result retrieved
    batch.on("response", function(rets) {
        /*for (var i=0; i < rets.length; i++) {
			if (rets[i].success) {
				console.log("#" + (i+1) + " loaded successfully, id = " + rets[i].id);
			} else {
				console.log("#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', '));
			}
		}*/
        console.log('Inserted!!');
    });


}

