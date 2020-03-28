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

function onResetClick(){
    var textArray = $("input");
    $.each(textArray,function(i,v){
        $(v).val("");
    });
}

function onSubmitClick(){
    var jsonData={};
    jsonData.GuestName=$("#name").val();
    jsonData.ContactPerson=$("#contactPerson").val();
    jsonData.Mobile=$("#mobile").val();
    jsonData.Purpose=$("[name=purpose]").val();
    jsonData.EMail=$("#emailID").val();
    jsonData.NationalIdentity=$("[name=nationalIDDdl]").val() + ":"+$("#nationalID").val();
    SendData(jsonData);
}

function SendData(data){
    insertData(data);
}

function ReadDataFromDB(){   
    
    function ReadSuccess(tx,result){
        $("#logoffContent ul").empty();
        $("#logoffContent ul").append(AddDataFromDB(result)).listview("refresh");
    }

    function ReadFailed(error){
        alert("Read From DB Failed...");
    }
    
    myDB.transaction(function(transaction){
        let selectQuery = "Select * from GUESTDETAILS";
        transaction.executeSql(selectQuery,[],ReadSuccess,ReadFailed);
    });

    

    function AddDataFromDB(result){
        let str='';
        for(i=result.rows.length-1;i>=0;i--){
            str+= '<li ><a><h3>';
            str+=result.rows.item(i).guestname;
            str+='</h3><p>';        
            str+=result.rows.item(i).contactperson;
            str+='</p><p>';
            str+="09:00";        
            str+='</p></a></li>';
        }
        return str;
    }
}

function insertData(guestData){
    var title = "Keshav";
var desc = "Lose Yourself";
myDB.transaction(function(transaction)
{
    var executeQuery = "INSERT INTO GUESTDETAILS (GUESTNAME,CONTACTPERSON,MOBILE,PURPOSE,EMAIL,NATIONALID) VALUES (?,?,?,?,?,?)";
    let paramValues = [guestData.GuestName, guestData.ContactPerson,guestData.Mobile, guestData.Purpose,guestData.EMail, guestData.NationalIdentity];
    transaction.executeSql(executeQuery,paramValues, InsertSuccess,InsertFailed); 
});

function InsertSuccess(t,result){
    alert("Successfully Inserted...");
    ReadDataFromDB();
}

function InsertFailed(error){
    alert("Failed Inserting data...");
}
}

function InitializeDB(){
    myDB = window.sqlitePlugin.openDatabase({name: "guestDataBase.db", location: 'default'});
    myDB.transaction(function(transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS guestDetails (guestname text, contactperson text, mobile text, purpose text,email text, nationalid text)', [],
            function(tx, result) {
                alert("Table created successfully");
            },
            function(error) {
                alert("Error occurred while creating the table.");
            });
    });
}

function DeleteAllData(){
    function DeleteSucceeded(error){
        alert("Successfully Deleted All Entries.");
    }
    myDB.transaction(function(transaction){
        transaction.executeSql("delete from GUESTDETAILS",[],DeleteSucceeded);
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
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
    }
};

app.initialize();