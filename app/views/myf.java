String stat = data.get("stat");

String patientName = data.get("patientName");
String phone = data.get("phone");
Double referred = data.get("referred");
String FacilityCode = data.get("facility");
String Facility = db.executeQueryObject("SELECT FACILITY_NAME FROM PD_FACILITY_MASTER WHERE FACILITY_CODE = ?",new Object[]{FacilityCode});
String otherindication = data.get("otherindication");
String otherangio = data.get("otherangio");

List<RPCModelData> emailList = db.executeQuery("select distinct email_address from ra_users where user_id in(select user_id from ra_user_roles where role_id in (select role_id from ra_roles where role_code in ('Doctor','Marketing Rep','Schedular')))", new Object[]{});

/*
string bilultra = data.get("bilultra");
string rightultra = data.get("rightultra");
string leftultra = data.get("leftultra");
string ultraconsult = data.get("ultraConsult");
string angiogram = data.get("angiogram");
string venogram = data.get("venogram");




string claudication = data.get("claudication");
string absentpulses = data.get("absentpulses");
string dvt = data.get("dvt");
string pain = data.get("pain");
string interevaluation = data.get("interevaluation");
string surgicalevaluation = data.get("surgicalevaluation");
string pvd = data.get("pvd");
string swelling = data.get("swelling");
string ulcer = data.get("ulcer");
string varicoseveins = data.get("varicoseveins");



*/
if("Y".equals(stat)){
  
StringBuilder statsbody = new StringBuilder();
//statsbody.append("<body style=\"border: 1px solid rgb(221,221,221); border-radius: 10px;background-color: rgb(221,221,221);\">");
statsbody.append("<table style=\"font-family: Helvetica Neue, Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #212f40; width: 300px;\" cellpadding=\"0\" cellspacing=\"0\">");
statsbody.append("<tbody>");
statsbody.append("<tr style=\"text-align: left; vertical-align: baseline\">");
statsbody.append("<td style=\"border-bottom: 1px solid; font-size: 18px; color: #596573\" colspan=\"2\"><b>STAT Referral </b></td></tr>");
statsbody.append("<table style=\"margin-top: 5px;border-bottom: 1px dotted;width: 300px;\">");
statsbody.append("<tbody>");
statsbody.append("<tr>");
statsbody.append("<td>Patient Name</td>");
statsbody.append("<td>: "+patientName+"</td>");
statsbody.append("</tr>");
statsbody.append("<tr>");
statsbody.append("<td>Patient Contact Number</td>");
statsbody.append("<td>: "+phone+"</td>");
statsbody.append("</tr>");
statsbody.append("<tr>");
statsbody.append("<td>Facility</td>");
statsbody.append("<td>: "+Facility+"</td>");
statsbody.append("</tr>");
statsbody.append("</tbody>");
statsbody.append("</table>");

  
 ArrayList list = new ArrayList();

   
/* section 1 Arterial,Bilateral*/
statsbody.append("<table style=\"margin-top: 5px;border-bottom: 1px dotted; width: 300px;\">");
statsbody.append("<tbody>");

for(String name : data.getPropertyNames()){ 
if("Y".equals(data.get(name))){
  if("arterialDuplex".equalsIgnoreCase(name)){
		statsbody.append("<tr><td>Arterial</td></tr>");  	
  }else if("venousDuplex".equalsIgnoreCase(name)){
  	statsbody.append("<tr><td>Venous</td></tr>");
  }else if("bilUltra".equalsIgnoreCase(name)){
  	statsbody.append("<tr><td>Bilateral</td></tr>");
  }else if("rightUltra".equalsIgnoreCase(name)){
  	statsbody.append("<tr><td>Right</td></tr>");
  }else if("leftUltra".equalsIgnoreCase(name)){
  	statsbody.append("<tr><td>Left</td></tr>");
  }
	}
}
		statsbody.append("</tbody>");
  	statsbody.append("</table>");

/* section 1 Arterial,Bilateral*/

statsbody.append("<table style=\"margin-top: 5px;border-bottom: 1px dotted;  width: 300px;\">");
statsbody.append("<tbody>");
statsbody.append("<tr>");
statsbody.append("<td><b>Evaluation/Treatment</b></td></tr>");
for(String name : data.getPropertyNames()){ 
if("Y".equals(data.get(name))){
  if("ultraconsult".equalsIgnoreCase(name)){
		statsbody.append("<tr><td>Ultra Sound & Consultation </td></tr>");  	
  }else if("angiogram".equalsIgnoreCase(name)){
  	statsbody.append("<tr><td>Angiogram With Possible Intervention</td></tr>");
  }else if("venogram".equalsIgnoreCase(name)){
  	statsbody.append("<tr><td>Venogram With Possible Intervention</td></tr>");
  }else if("otherVenogram".equalsIgnoreCase(name)){
  	statsbody.append("<tr><td>"+data.get("otherVenogram")+"</td></tr>");
  }
	}
}
statsbody.append("</tbody>");
statsbody.append("</table>");


statsbody.append("<table style=\"margin-top: 5px;border-bottom: 1px dotted;  width: 300px;\">");
statsbody.append("<tbody>");
statsbody.append("<tr>");
statsbody.append("<td><b>Indiacations</td></b></tr>");
for(String name : data.getPropertyNames()){ 
if("Y".equals(data.get(name))){
  if("claudication".equalsIgnoreCase(name)){
		statsbody.append("<tr><td>Claudication</td></tr>");  	
  }else if("dvt".equalsIgnoreCase(name)){
  	statsbody.append("<tr><td>DVT</td></tr>");
  }else if("interevaluation".equalsIgnoreCase(name)){
  	statsbody.append("<tr><td>Post Intervention Evaluation</td></tr>");
  }else if("pvd".equalsIgnoreCase(name)){
  	statsbody.append("<tr><td>PVD</td></tr>");
  }else if ("ulcer".equals(name)){
      statsbody.append("<tr> <td> Ulcer/Non-Healing Wound</td> </tr>");
  }else if ("absentPulses".equals(name)){
      statsbody.append("<tr> <td> Decreased/Absent Pulses</td> </tr>");
  }else if ("pain".equals(name)){
      statsbody.append("<tr> <td>Pain</td> </tr>");
  }else if ("surgicalEvaluation".equals(name)){
      statsbody.append("<tr> <td>Pre-Surgical Evaluation</td> </tr>");
  }else if ("swelling".equals(name)){
      statsbody.append("<tr> <td>Swelling/Edema</td> </tr>");
  }else if ("varicoseVeins".equals(name)){
      statsbody.append("<tr> <td>Varicose Veins</td> </tr>");
  }else if ("otherIndication".equals(name)){
      statsbody.append("<tr> <td>"+data.get("otherIndication")+"</td> </tr>");
  }
	}
}
statsbody.append("</tbody>");
statsbody.append("</table>");

statsbody.append("<table style=\"margin-top: 5px;border-bottom: 1px dotted;  width: 300px;\">");
statsbody.append("<tbody>");
statsbody.append("<tr>");
statsbody.append("<td><b>Refered By</td></b>");
statsbody.append("<td><b>: "+user+"</td></b>");
statsbody.append("</tr>");
statsbody.append("<tr>");
statsbody.append("<td><b>Refered Date</td></b>");
statsbody.append("<td><b>: "+db.getSessionValue("sysdate")+"</td></b>");
statsbody.append("</tr>");
statsbody.append("</tbody>");
statsbody.append("</table>");

statsbody.append("</tbody></table>");
  
  if(emailList != null && emailList.size() > 0){
  
 	for (int i=0, len=emailList.size(); i<len; i++) {   
   
  RPCModelData emaildata = (RPCModelData)emailList.get(i);
  if(emaildata.get("EMAIL_ADDRESS") != null) {
   // vanesa@liaisonmarketingsolutions.com>
	 	db.sendEmail("srikanth.akkapu@telidos.com",null,null,"STAT Referral",statsbody.toString(),"Y");

   
  	 }
  
 		}
	}