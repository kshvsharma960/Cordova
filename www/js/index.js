/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

$("button[type=reset]").on("click",onResetClick);
$("button[type=submit]").on("click",onSubmitClick);

$("purpose").change(function(){
    var selectedCountry = $(this).children("option:selected").val();
    alert("You have selected the country - " + selectedCountry);
});

var myDB ;
var paramValues;
var DBColumns=[];
var profilePageData={};
profilePageData.ProfileGuestName=document.getElementById("ProfileGuestName");
profilePageData.ProfileGuestContactPerson=document.getElementById("ProfileContactPerson");
profilePageData.ProfilePurpose=document.getElementById("ProfilePurpose");
profilePageData.ProfileMobile=document.getElementById("ProfileMobile");
profilePageData.ProfileMailID=document.getElementById("ProfileMailID");;
profilePageData.ProfileLoginTime=document.getElementById("ProfileLoginTime");
profilePageData.ProfilePicture=document.getElementById("guestImage");

function onResetClick(){
    var textArray = $("input");
    $.each(textArray,function(i,v){
        $(v).val("");
    });
    $("#guestImageAtLogin").attr("src","");
    $("#guestImageAtLogin").attr("alt","");
    
}

function onSubmitClick(){
var _date =new Date();
    var jsonData={};
    jsonData.GuestName=$("#name").val();
    jsonData.ContactPerson=$("#contactPerson").val();
    jsonData.Mobile=$("#mobile").val();
    jsonData.Purpose=$("[name=purpose]").val();
    jsonData.EMail=$("#emailID").val();
    jsonData.NationalIdentity=$("[name=nationalIDDdl]").val() + ":"+$("#nationalID").val();
    jsonData.LoginTime=_date.toISOString();
    jsonData.LogoutTime="";
    jsonData.ImagePath = $("#guestImageAtLogin").attr("src");
    SendData(jsonData);
    
}

function OpenCamera(){
    navigator.camera.getPicture(onSuccess, onFail, { quality: 20,
        destinationType: Camera.DestinationType.DATA_URI
        //sourceType: Camera.PictureSourceType.PHOTOLIBRARY
     });
  
     function onSuccess(imageURL) {
        var image = document.getElementById('guestImageAtLogin');
        image.src = imageURL;
     }
  
     function onFail(message) {
        alert('Failed because: ' + message);
     }
}

function SendData(data){
    insertData(data);

}

function PopulateProfilePage(result){
    if(result!=null){
        if(result.rows.length>0){
            let i=0;
    profilePageData.ProfileGuestName.innerText=result.rows.item(i).guestname + " ("+result.rows.item(i).guestid+")";
    profilePageData.ProfilePicture.setAttribute("alt",result.rows.item(i).guestname);
    profilePageData.ProfilePicture.setAttribute("src",result.rows.item(i).imagepath);
    profilePageData.ProfileGuestContactPerson.innerText=result.rows.item(i).contactperson;
    profilePageData.ProfileMailID.innerText=result.rows.item(i).email;
    profilePageData.ProfileMobile.innerText=result.rows.item(i).mobile;
    profilePageData.ProfilePurpose.innerText=result.rows.item(i).purpose;
    profilePageData.ProfileLoginTime.innerText=(new Date(result.rows.item(i).logintime).toLocaleTimeString([],{hour: '2-digit',minute:'2-digit'}));
    }
}
}

function GetProfileData(gid){
    function ReadSuccess(tx,result){
        PopulateProfilePage(result);        
    }

    function ReadFailed(tx,error){
        alert("Read From DB Failed...");
    }
    
    myDB.transaction(function(transaction){
        let selectQuery = "Select * from GUESTDETAILS where guestid = '"+gid+"'";
        transaction.executeSql(selectQuery,[],ReadSuccess,ReadFailed);
    }); 
}

function logoffListClicked(e){
var gid=e.currentTarget.id;
GetProfileData(gid);
NavigateToPage(3);
}

function NavigateToPage(pageID){
    $.mobile.navigate( "#page"+pageID );
}

function ReadDataFromDB(){   
    
    function ReadSuccess(tx,result){
        $("#logoffContent ul").empty();
        $("#logoffContent ul").append(AddDataFromDB(result));
        $('#logoffContent ul').children('li').bind('tap', logoffListClicked);
        $("#logoffContent ul").listview("refresh");
    }

    function ReadFailed(tx,error){
        alert("Read From DB Failed...");
    }
    
    myDB.transaction(function(transaction){
        let selectQuery = "Select * from GUESTDETAILS where LOGOUTTIME = ''";
        transaction.executeSql(selectQuery,[],ReadSuccess,ReadFailed);
    });

    

    function AddDataFromDB(result){
        let str='';
        for(i=result.rows.length-1;i>=0;i--){
            str+= '<li id="'+result.rows.item(i).guestid+'"><a><h3>';
            str+=result.rows.item(i).guestname + " ("+result.rows.item(i).guestid+")";
            str+='</h3><p>';        
            str+=result.rows.item(i).contactperson;
            str+='</p><p>';
            str+=new Date(result.rows.item(i).logintime).toLocaleTimeString([],{hour: '2-digit',minute:'2-digit'});
            str+='</p><p>';
            str+=new Date(result.rows.item(i).logintime).toDateString();            
            str+='</p></a></li>';
        }
        return str;
    }
}

function ProcessLogout(e){

    var uniqueID = profilePageData.ProfileMobile.innerText;
    function UpdateSuccess(t,result){
        alert("Successfully Logged Out. Thanks for visiting.");
        ReadDataFromDB();
        history.back();
    }
    
    function UpdateFailed(t,error){
        alert("Logout Failed."+error.code);
    }

    myDB.transaction(function(transaction)
    {
        var executeQuery = "UPDATE GUESTDETAILS SET LOGOUTTIME = datetime('now', 'localtime') where MOBILE = '"+uniqueID+"'";
        
        transaction.executeSql(executeQuery,[], UpdateSuccess,UpdateFailed); 
    });
}

function UpdateImagePath(imgPath,gid){
    function UpdateSuccess(t,result){
        console.log("Successfully Updated Image Path.");        
    }
    
    function UpdateFailed(t,error){
        alert("Update Image  Failed."+error.code);
    }

    myDB.transaction(function(transaction)
    {
        var executeQuery = "UPDATE GUESTDETAILS SET IMAGEPATH = '"+imgPath+"' where GUESTID = '"+gid+"'";
        
        transaction.executeSql(executeQuery,[], UpdateSuccess,UpdateFailed); 
    });
}

function insertData(guestData){

var date =new Date();
myDB.transaction(function(transaction)
{
    var executeQuery = "INSERT INTO GUESTDETAILS (GUESTNAME,CONTACTPERSON,MOBILE,PURPOSE,EMAIL,NATIONALID,LOGINTIME,LOGOUTTIME,IMAGEPATH) VALUES (?,?,?,?,?,?,?,?,?)";
    paramValues = [guestData.GuestName, guestData.ContactPerson,guestData.Mobile, guestData.Purpose,guestData.EMail, guestData.NationalIdentity,guestData.LoginTime,guestData.LogoutTime,guestData.ImagePath];
    transaction.executeSql(executeQuery,paramValues, InsertSuccess,InsertFailed); 
});

function InsertSuccess(t,result){
    alert("Successfully Inserted...");
    GetProfileData(result.insertId);
    NavigateToPage(3);
    onResetClick();
    ReadDataFromDB();
}

function InsertFailed(t,error){
    alert("Failed Inserting data...");
}
}

function OverrideBackButton(){
    document.addEventListener('deviceready',function(){
        var exitApp = false,intval = setInterval(function(){
            exitApp=false;
        },1000);
        document.addEventListener('backbutton',function(e){
            e.preventDefault();
            if(exitApp){
                clearInterval(intval)
                (navigator.app && navigator.app.exitApp())|| (device && device.exitApp())
            }
            else{
                exitApp=true;
                history.back(1);
            }
        },false);
        },false);
    }

function ExportToCSV(){  
    GetColumns();
    function WriteToFile(str){
function fail(err){
    console.log("Failed");
}

        function gotFS(fileSystem) {
            fileSystem.getDirectory("GuestList", {create :true},gotDir,fail);
            console.log("Directory created")            ;
        }
    
        function gotDir(dirEntry){
            dirEntry.getFile("GuestList.csv", {create :true,exclusive : false},gotFileEntry,fail);
        }
        function gotFileEntry(fileEntry) {
            fileEntry.createWriter(gotFileWriter, fail);
        }
    
        function gotFileWriter(writer) {
            writer.onwriteend = function() {
                alert("Exported Successfully to : " + cordova.file.externalRootDirectory);
            }
            writer.onerror = function(e) {
               alert('Write failed: ' + e.toString());
            };

            writer.write(str);
            
        }
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, gotFS, fail);
    }

    function ReadSuccess(tx,result){
        let str='';
            $.each(DBColumns,function(i,v){
                str += v.name + ", ";  
            });
            for(i=result.rows.length-1;i>=0;i--){    
                $.each(Object.keys(result.rows.item(0)),function(j,v){        
                str+=result.rows.item(i)[v] + ", ";   
                }); 
                str+="\n";
            }
        WriteToFile(str);    
    }

    function ReadFailed(tx,error){
        alert("Read From DB Failed...");
    }
    
    myDB.transaction(function(transaction){
        let selectQuery = "Select * from GUESTDETAILS";
        transaction.executeSql(selectQuery,[],ReadSuccess,ReadFailed);
    });
}

function GetColumns(){

    function ReadSuccess(tx,colData){
        for(var ind=0;ind<colData.rows.length;ind++){
            DBColumns.push(colData.rows.item(ind));
        }        
    }

    function ReadFailed(tx,error){
        alert("Read From DB Failed...");
    }
    
    myDB.transaction(function(transaction){
        let selectQuery = "pragma table_info(GUESTDETAILS)";
        transaction.executeSql(selectQuery,[],ReadSuccess,ReadFailed);
    });
}

function InitializeDB(){
    myDB = window.sqlitePlugin.openDatabase({name: "guestDataBase.db", location: 'default'});
    myDB.transaction(function(transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS guestDetails (guestid integer PRIMARY KEY,guestname text, contactperson text, mobile text, purpose text,email text, nationalid text, logintime text,logouttime text, imagepath text)', [],
            function(tx, result) {
                console.log("Table created successfully");
            },
            function(error) {
                console.log("Error occurred while creating the table.");
            });
    });
}

function DeleteAllData(){
    function DeleteSucceeded(error){
        alert("Successfully Deleted All Entries.");
        InitializeDB();
        onResetClick();
    }
    myDB.transaction(function(transaction){
        transaction.executeSql("drop table GUESTDETAILS",[],DeleteSucceeded);
    });
}
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        InitializeDB();
        this.receivedEvent('deviceready');
        ReadDataFromDB();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //welcome screen
        var exitApp = false,intval = setInterval(function(){
            exitApp=false;
        },1000);
        document.addEventListener('backbutton',function(e){
            e.preventDefault();
            if(exitApp){
                clearInterval(intval)
                (navigator.app && navigator.app.exitApp())|| (device && device.exitApp())
            }
            else{
                exitApp=true;
                history.back(1);
            }
        },false);
        var parentElement = document.getElementById("logoffContentUL");
        $(parentElement).css("height",window.innerHeight);
    }
};

app.initialize();