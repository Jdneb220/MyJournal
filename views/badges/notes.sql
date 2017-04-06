
<%
rsC.close
dim i
dim myAwards
Application("wConnectString") = "Provider=SQLOLEDB.1;Persist Security Info=False;User ID=webuser;Password=webuser;Initial Catalog=HART; Data Source=USDFSRV3"



'Establish the awards a person has already receieved and add them to a string with '[' ']' delimeters
strSQL = "SELECT AchievementID as AID from tblPersonAchievement WHERE  usdfnum = '" & request.cookies("UserNum") & "' order by AchievementID asc"
rsP.open strSQL, Application("wConnectString"), 3, 4
i = 0
myAwards = "myAwards="

do while not rsP.eof
  i = i + 1
  myAwards = myAwards & "[" & cstr(rsP.fields("AID")) & "]"
  rsP.movenext
loop
rsP.close




'Series of Awards check
strSQL = "SELECT USDFNum, " & _
            "max(CASE WHEN (lesson + clinic + Schooling + Show + Trail)   >= 8 THEN '1' ELSE '0' END) as '1', " & _
            "max(CASE WHEN (lesson + clinic + Schooling + Show + Trail)   >= 24 THEN '1' ELSE '0'END) as '2', " & _
        "max(CASE WHEN (lesson + clinic + Schooling + Show + Trail)   >= 40 THEN '1' ELSE '0' END) as '3', " & _
        "max(CASE WHEN (lesson + clinic + Schooling + Show + Trail)   >= 48 THEN '1' ELSE '0' END) as '4', " & _
        "max(CASE WHEN (lesson + clinic + Schooling + Show + Trail)   >= 168 THEN '1' ELSE '0' END) as '5' " & _
"FROM   tblPerson WHERE  usdfnum = '" & request.cookies("UserNum") & "' group by usdfnum"
rsP.open strSQL, Application("wConnectString"), 3, 4

for z = 1 to 5
  if rsP.fields(cStr(z)) and inStr(myAwards,"["&cStr(z)&"]") = 0 then
    %> <!--#include file="IndividualAward.asp"--> <%

  end if
next
'End Awards Check
rsP.close

select case request.form("type")
case "Lesson"

'Series of  Awards check
strSQL = "SELECT USDFNum, " & _
        "max(CASE WHEN (lesson)   >= 1 THEN '1' ELSE '0' END) as '6', " & _
        "max(CASE WHEN (lesson)   >= 5 THEN '1' ELSE '0' END) as '7', " & _
        "max(CASE WHEN (lesson)   >= 10 THEN '1' ELSE '0' END) as '8', " & _
        "max(CASE WHEN (lesson)   >= 15 THEN '1' ELSE '0' END) as '9', " & _
        "max(CASE WHEN (lesson)   >= 20 THEN '1' ELSE '0' END) as '10', " & _
        "max(CASE WHEN (lesson)   >= 30 THEN '1' ELSE '0' END) as '11', " & _
        "max(CASE WHEN (lesson)   >= 50 THEN '1' ELSE '0' END) as '12', " & _
        "max(CASE WHEN (lesson)   >= 100 THEN '1' ELSE '0' END) as '13' " & _
"FROM   tblPerson WHERE  usdfnum = '" & request.cookies("UserNum") & "' group by usdfnum"
rsP.open strSQL, Application("wConnectString"), 3, 4

for z = 6 to 13
  if rsP.fields(cStr(z)) and inStr(myAwards,"["&cStr(z)&"]") = 0 then
    %> <!--#include file="IndividualAward.asp"--> <%
  end if
next
'End Awards Check
rsP.close


case "Clinic"

'Series of  Awards check
strSQL = "SELECT USDFNum, " & _
        "max(CASE WHEN (clinic)   >= 1 THEN '1' ELSE '0' END) as '14', " & _
        "max(CASE WHEN (clinic)   >= 5 THEN '1' ELSE '0' END) as '15', " & _
        "max(CASE WHEN (clinic)   >= 10 THEN '1' ELSE '0' END) as '16', " & _
        "max(CASE WHEN (clinic)   >= 15 THEN '1' ELSE '0' END) as '17', " & _
        "max(CASE WHEN (clinic)   >= 20 THEN '1' ELSE '0' END) as '18', " & _
        "max(CASE WHEN (clinic)   >= 25 THEN '1' ELSE '0' END) as '19' " & _

"FROM   tblPerson WHERE  usdfnum = '" & request.cookies("UserNum") & "' group by usdfnum"
rsP.open strSQL, Application("wConnectString"), 3, 4

for z = 14 to 19
  if rsP.fields(cStr(z)) and inStr(myAwards,"["&cStr(z)&"]") = 0 then
    %> <!--#include file="IndividualAward.asp"--> <%

  end if
next
'End Awards Check
rsP.close

case "Schooling"

'Series of  Awards check
strSQL = "SELECT USDFNum, " & _
        "max(CASE WHEN (Schooling)   >= 1 THEN '1' ELSE '0' END) as '20', " & _
        "max(CASE WHEN (Schooling)   >= 5 THEN '1' ELSE '0' END) as '21', " & _
        "max(CASE WHEN (Schooling)   >= 10 THEN '1' ELSE '0' END) as '22', " & _
        "max(CASE WHEN (Schooling)   >= 20 THEN '1' ELSE '0' END) as '23', " & _
        "max(CASE WHEN (Schooling)   >= 35 THEN '1' ELSE '0' END) as '24', " & _
        "max(CASE WHEN (Schooling)   >= 50 THEN '1' ELSE '0' END) as '25', " & _
        "max(CASE WHEN (Schooling)   >= 75 THEN '1' ELSE '0' END) as '26', " & _
        "max(CASE WHEN (Schooling)   >= 100 THEN '1' ELSE '0' END) as '27', " & _
        "max(CASE WHEN (Schooling)   >= 125 THEN '1' ELSE '0' END) as '28', " & _
        "max(CASE WHEN (Schooling)   >= 150 THEN '1' ELSE '0' END) as '29', " & _
        "max(CASE WHEN (Schooling)   >= 200 THEN '1' ELSE '0' END) as '30', " & _
        "max(CASE WHEN (Schooling)   >= 250 THEN '1' ELSE '0' END) as '31', " & _
        "max(CASE WHEN (Schooling)   >= 300 THEN '1' ELSE '0' END) as '32', " & _
        "max(CASE WHEN (Schooling)   >= 350 THEN '1' ELSE '0' END) as '33', " & _
        "max(CASE WHEN (Schooling)   >= 400 THEN '1' ELSE '0' END) as '34', " & _
        "max(CASE WHEN (Schooling)   >= 500 THEN '1' ELSE '0' END) as '35' " & _

"FROM   tblPerson WHERE  usdfnum = '" & request.cookies("UserNum") & "' group by usdfnum"
rsP.open strSQL, Application("wConnectString"), 3, 4

for z = 20 to 35
  if rsP.fields(cStr(z)) and inStr(myAwards,"["&cStr(z)&"]") = 0 then
    %> <!--#include file="IndividualAward.asp"--> <%

  end if
next
'End Awards Check
rsP.close

case "Show"

'Series of  Awards check
strSQL = "SELECT USDFNum, " & _
        "max(CASE WHEN (Show)   >= 1 THEN '1' ELSE '0' END) as '36', " & _
        "max(CASE WHEN (Show)   >= 2 THEN '1' ELSE '0' END) as '37', " & _
        "max(CASE WHEN (Show)   >= 5 THEN '1' ELSE '0' END) as '38', " & _
        "max(CASE WHEN (Show)   >= 10 THEN '1' ELSE '0' END) as '39', " & _
        "max(CASE WHEN (Show)   >= 15 THEN '1' ELSE '0' END) as '40', " & _
        "max(CASE WHEN (Show)   >= 20 THEN '1' ELSE '0' END) as '41', " & _
        "max(CASE WHEN (Show)   >= 25 THEN '1' ELSE '0' END) as '42', " & _
        "max(CASE WHEN (Show)   >= 35 THEN '1' ELSE '0' END) as '43', " & _
        "max(CASE WHEN (Show)   >= 50 THEN '1' ELSE '0' END) as '44', " & _
        "max(CASE WHEN (Show)   >= 75 THEN '1' ELSE '0' END) as '45', " & _
        "max(CASE WHEN (Show)   >= 100 THEN '1' ELSE '0' END) as '46' " & _

"FROM   tblPerson WHERE  usdfnum = '" & request.cookies("UserNum") & "' group by usdfnum"
rsP.open strSQL, Application("wConnectString"), 3, 4

for z = 36 to 46
  if rsP.fields(cStr(z)) and inStr(myAwards,"["&cStr(z)&"]") = 0 then
    %> <!--#include file="IndividualAward.asp"--> <%

  end if
next
'End Awards Check
rsP.close

case "Trail"

'Series of  Awards check
strSQL = "SELECT USDFNum, " & _
        " max(CASE WHEN (Trail)   >= 1 THEN '1' ELSE '0' END) as '47', " & _
        "max(CASE WHEN (Trail)   >= 5 THEN '1' ELSE '0' END) as '48', " & _
        "max(CASE WHEN (Trail)   >= 8 THEN '1' ELSE '0' END) as '49', " & _
        "max(CASE WHEN (Trail)   >= 10 THEN '1' ELSE '0' END) as '50', " & _
        "max(CASE WHEN (Trail)   >= 15 THEN '1' ELSE '0' END) as '51', " & _
        "max(CASE WHEN (Trail)   >= 20 THEN '1' ELSE '0' END) as '52', " & _
        "max(CASE WHEN (Trail)   >= 25 THEN '1' ELSE '0' END) as '53', " & _
        "max(CASE WHEN (Trail)   >= 35 THEN '1' ELSE '0' END) as '54', " & _
        "max(CASE WHEN (Trail)   >= 50 THEN '1' ELSE '0' END) as '55', " & _
        "max(CASE WHEN (Trail)   >= 75 THEN '1' ELSE '0' END) as '56', " & _
        "max(CASE WHEN (Trail)   >= 100 THEN '1' ELSE '0' END) as '57', " & _
        "max(CASE WHEN (Trail)   >= 125 THEN '1' ELSE '0' END) as '58', " & _
        "max(CASE WHEN (Trail)   >= 150 THEN '1' ELSE '0' END) as '59', " & _
        "max(CASE WHEN (Trail)   >= 175 THEN '1' ELSE '0' END) as '60', " & _
        "max(CASE WHEN (Trail)   >= 200 THEN '1' ELSE '0' END) as '61', " & _
        "max(CASE WHEN (Trail)   >= 250 THEN '1' ELSE '0' END) as '62', " & _
        "max(CASE WHEN (Trail)   >= 300 THEN '1' ELSE '0' END) as '63' " & _

"FROM   tblPerson WHERE  usdfnum = '" & request.cookies("UserNum") & "' group by usdfnum"
rsP.open strSQL, Application("wConnectString"), 3, 4

for z = 47 to 63
  if rsP.fields(cStr(z)) and inStr(myAwards,"["&cStr(z)&"]") = 0 then
    %> <!--#include file="IndividualAward.asp"--> <%

  end if
next
'End Awards Check
rsP.close


end select


'Every Type
strSQL = "SELECT USDFNum, " & _
        " max(CASE WHEN (lesson >= 1) and (clinic >= 1) and (Schooling >= 1) and (Show >= 1 ) and (Trail>= 1) THEN '1' ELSE '0' END) as '64', " &_
    " max(CASE WHEN (lesson >= 2) and (clinic >= 2) and (Schooling >= 2) and (Show >= 2 ) and (Trail>= 2) THEN '1' ELSE '0'END) as '65', " &_
        " max(CASE WHEN (lesson >= 5) and (clinic >= 5) and (Schooling >= 5) and (Show >= 5 ) and (Trail>= 5) THEN '1' ELSE '0' END) as '66', " &_
        " max(CASE WHEN (lesson >= 8) and (clinic >= 8) and (Schooling >= 8) and (Show >= 8 ) and (Trail>= 8) THEN '1' ELSE '0' END) as '67', " &_
        " max(CASE WHEN (lesson >= 10) and (clinic >= 10) and (Schooling >= 10) and (Show >= 10 ) and (Trail>= 10) THEN '1' ELSE '0' END) as '68', " &_
        " max(CASE WHEN (lesson >= 15) and (clinic >= 15) and (Schooling >= 15) and (Show >= 15 ) and (Trail>= 15) THEN '1' ELSE '0' END) as '69', " &_
        " max(CASE WHEN (lesson >= 20) and (clinic >= 20) and (Schooling >= 20) and (Show >= 20 ) and (Trail>= 20) THEN '1' ELSE '0' END) as '70', " &_
        " max(CASE WHEN (lesson >= 25) and (clinic >= 25) and (Schooling >= 25) and (Show >= 25 ) and (Trail>= 25) THEN '1' ELSE '0' END) as '71' " &_

"FROM   tblPerson WHERE  usdfnum = '" & request.cookies("UserNum") & "' group by usdfnum"
rsP.open strSQL, Application("wConnectString"), 3, 4

for z = 64 to 71
  if rsP.fields(cStr(z)) and inStr(myAwards,"["&cStr(z)&"]") = 0 then
    %> <!--#include file="IndividualAward.asp"--> <%

  end if
next
'End Awards Check
rsP.close





'4+ hour Trail Ride check

for z = 82 to 82
  if hours >= 4 and inStr(myAwards,"["&cStr(z)&"]") = 0 then
    %> <!--#include file="IndividualAward.asp"--> <%


  end if
next
'End Awards Check


'8+ hour Trail Ride check


for z = 83 to 83
  if hours >= 8 and inStr(myAwards,"["&cStr(z)&"]") = 0 then
    %> <!--#include file="IndividualAward.asp"--> <%

  end if
next
'End Awards Check










'3 separate day award check
'4/15/2014 the following query does not work in the new version of SQL
'commenting out until the query can be recoded

'Select top 1 usdfnum, 1 as '80' from tblrides where ridedate in (Select dateadd(dd, 0, ridedate) from tblrides where usdfnum = '185828' ) and ridedate in (Select dateadd(dd, -1, ridedate) from tblrides where usdfnum = '185828' ) and ridedate in (Select dateadd(dd, -2, ridedate) from tblrides where usdfnum = '185828' ) order by ridedate

'strSQL = "Select top 1 usdfnum, 1 as '80'  from tblrides where ridedate in (Select dateadd(dd, 0, ridedate) from tblrides where usdfnum = '" & request.cookies("UserNum") & "'   )  and ridedate in (Select dateadd(dd, -1, ridedate) from tblrides where usdfnum = '" & request.cookies("UserNum") & "'   ) and ridedate in (Select dateadd(dd, -2, ridedate) from tblrides where usdfnum = '" & request.cookies("UserNum") & "'   ) order by ridedate"
'response.write strSQL
'rsP.open strSQL, Application("wConnectString"), 3, 4

'for z = 80 to 80
  'if not rsP.EOF and inStr(myAwards,"["&cStr(z)&"]") = 0 then
    ' #include file="IndividualAward.asp"

  'end if
'next
'End Awards Check
'rsP.close





'5 separate day award check
'4/15/2014 same issue as above

'strSQL = "Select top 1 usdfnum, 1 as '81'  from tblrides where ridedate in (Select dateadd(dd, 0, ridedate) from tblrides where usdfnum = '" & request.cookies("UserNum") & "'   )  and ridedate in (Select dateadd(dd, -1, ridedate) from tblrides where usdfnum = '" & request.cookies("UserNum") & "'   ) and ridedate in (Select dateadd(dd, -2, ridedate) from tblrides where usdfnum = '" & request.cookies("UserNum") & "'   ) and  ridedate in (Select dateadd(dd, -3, ridedate) from tblrides where usdfnum = '" & request.cookies("UserNum") & "'   ) and ridedate in (Select dateadd(dd, -4, ridedate) from tblrides where usdfnum = '" & request.cookies("UserNum") & "'   ) order by ridedate"
'rsP.open strSQL, Application("wConnectString"), 3, 4

'for z = 81 to 81
  'if not rsP.EOF and inStr(myAwards,"["&cStr(z)&"]") = 0 then
    '#include file="IndividualAward.asp"

  'end if
'next
'End Awards Check
'rsP.close







%>
