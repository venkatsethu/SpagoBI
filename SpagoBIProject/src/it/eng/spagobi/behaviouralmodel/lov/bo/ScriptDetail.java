/*
 * SpagoBI, the Open Source Business Intelligence suite
 * � 2005-2015 Engineering Group
 *
 * This file is part of SpagoBI. SpagoBI is free software: you can redistribute it and/or modify it under the terms of the GNU
 * Lesser General Public License as published by the Free Software Foundation, either version 2.1 of the License, or any later version. 
 * SpagoBI is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details. You should have received
 * a copy of the GNU Lesser General Public License along with SpagoBI. If not, see: http://www.gnu.org/licenses/.
 * The complete text of SpagoBI license is included in the COPYING.LESSER file. 
 */
package it.eng.spagobi.behaviouralmodel.lov.bo;

import groovy.lang.Binding;
import it.eng.spago.base.SourceBean;
import it.eng.spago.base.SourceBeanAttribute;
import it.eng.spago.base.SourceBeanException;
import it.eng.spago.dbaccess.sql.DataRow;
import it.eng.spago.error.EMFInternalError;
import it.eng.spago.security.IEngUserProfile;
import it.eng.spagobi.analiticalmodel.document.handlers.ExecutionInstance;
import it.eng.spagobi.behaviouralmodel.analyticaldriver.bo.ObjParuse;
import it.eng.spagobi.commons.constants.SpagoBIConstants;
import it.eng.spagobi.commons.utilities.GeneralUtilities;
import it.eng.spagobi.commons.utilities.SpagoBITracer;
import it.eng.spagobi.utilities.scripting.SpagoBIScriptManager;

import java.io.File;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import org.apache.log4j.Logger;

/**
 * Defines the <code>ScriptDetail</code> objects. This object is used to store 
 * Script Wizard detail information.
 */
public class ScriptDetail extends DependenciesPostProcessingLov implements ILovDetail {

	static private Logger logger = Logger.getLogger(ScriptDetail.class);

	
	/**
	 * the script
	 */
	private String script = "";
	private String languageScript = "";		
	private List visibleColumnNames = null;
	private String valueColumnName = "";
	private String descriptionColumnName = "";
	private List invisibleColumnNames = null;

	/**
	 * constructor.
	 */
	public ScriptDetail() {}

	/**
	 * constructor.
	 * 
	 * @param dataDefinition xml representation of the script lov
	 * 
	 * @throws SourceBeanException the source bean exception
	 */
	public ScriptDetail(String dataDefinition) throws SourceBeanException {
		loadFromXML (dataDefinition);
	}


	/**
	 * loads the lov from an xml string.
	 * 
	 * @param dataDefinition the xml definition of the lov
	 * 
	 * @throws SourceBeanException the source bean exception
	 */
	public void loadFromXML (String dataDefinition) throws SourceBeanException {
		dataDefinition.trim();
		// build the sourcebean
		if(dataDefinition.indexOf("<SCRIPT>")!=-1) {
			int startInd = dataDefinition.indexOf("<SCRIPT>");
			int endId = dataDefinition.indexOf("</SCRIPT>");
			String script = dataDefinition.substring(startInd + 8, endId);
			script =script.trim();
			if(!script.startsWith("<![CDATA[")) {
				script = "<![CDATA[" + script  +  "]]>";
				dataDefinition = dataDefinition.substring(0, startInd+8) + script + dataDefinition.substring(endId); 
			}
		}
		SourceBean source = SourceBean.fromXMLString(dataDefinition);
		// get and set the script text
		SourceBean scriptSB = (SourceBean)source.getAttribute("SCRIPT");
		String script = scriptSB.getCharacters(); 
		setScript(script);
		// get and set value column
		String valueColumn = "";
		SourceBean valCol = (SourceBean)source.getAttribute("VALUE-COLUMN");
		if(valCol!=null)
			valueColumn = valCol.getCharacters();
		setValueColumnName(valueColumn);
		// get and set the description column
		String descrColumn = "";
		SourceBean descColSB = (SourceBean)source.getAttribute("DESCRIPTION-COLUMN");
		if(descColSB!=null)
			descrColumn = descColSB.getCharacters();
		setDescriptionColumnName(descrColumn);
		// get and set list of visible columns
		List visColNames = new ArrayList();
		SourceBean visColSB = (SourceBean)source.getAttribute("VISIBLE-COLUMNS");
		if(visColSB!=null){
			String visColConc = visColSB.getCharacters();
			if( (visColConc!=null) && !visColConc.trim().equalsIgnoreCase("") ) {
				String[] visColArr = visColConc.split(",");
				visColNames = Arrays.asList(visColArr);
			}
		}
		setVisibleColumnNames(visColNames);
		// get and set list of invisible columns
		List invisColNames = new ArrayList();
		SourceBean invisColSB = (SourceBean)source.getAttribute("INVISIBLE-COLUMNS");
		if(invisColSB!=null){
			String invisColConc = invisColSB.getCharacters();
			if( (invisColConc!=null) && !invisColConc.trim().equalsIgnoreCase("") ) {
				String[] invisColArr = invisColConc.split(",");
				invisColNames = Arrays.asList(invisColArr);
			}
		}
		setInvisibleColumnNames(invisColNames);

		SourceBean language = (SourceBean)source.getAttribute("LANGUAGE");
		if(language!=null){
			String lang=language.getCharacters();
			if(lang!=null)
				setLanguageScript(lang);
		}
	}



	/**
	 * serialize the lov to an xml string.
	 * 
	 * @return the serialized xml string
	 */
	public String toXML () { 
		String XML = "<SCRIPTLOV>" +
		"<SCRIPT>"+this.getScript()+"</SCRIPT>" +	
		"<VALUE-COLUMN>"+this.getValueColumnName()+"</VALUE-COLUMN>" +
		"<DESCRIPTION-COLUMN>"+this.getDescriptionColumnName()+"</DESCRIPTION-COLUMN>" +
		"<VISIBLE-COLUMNS>"+GeneralUtilities.fromListToString(this.getVisibleColumnNames(), ",")+"</VISIBLE-COLUMNS>" +
		"<INVISIBLE-COLUMNS>"+GeneralUtilities.fromListToString(this.getInvisibleColumnNames(), ",")+"</INVISIBLE-COLUMNS>" +
		"<LANGUAGE>"+this.getLanguageScript()+"</LANGUAGE>" +
		"</SCRIPTLOV>";
		return XML;
	}


	/**
	 * @see it.eng.spagobi.behaviouralmodel.lov.bo.ILovDetail#getLovResult(IEngUserProfile profile, List<ObjParuse> dependencies, ExecutionInstance executionInstance) throws Exception;
	 */
	public String getLovResult(IEngUserProfile profile, List<ObjParuse> dependencies, ExecutionInstance executionInstance) throws Exception {
		logger.debug("IN");
		String result = null;
		HashMap attributes = GeneralUtilities.getAllProfileAttributes(profile); // to be cancelled, now substitutution inline
		
		//Substitute profile attributes with their value
		String cleanScript=substituteProfileAttributes(getScript(), attributes);
		setScript(cleanScript);
		
		List<Object> imports = null;
		if( "groovy".equals(languageScript) ){
			imports = new ArrayList<Object>();
			URL url = Thread.currentThread().getContextClassLoader().getResource("predefinedGroovyScript.groovy");
			try {
				logger.debug("predefinedGroovyScript.groovy file URL is equal to [" + url + "]");
				imports.add(url);
			} catch (Throwable t) {
				logger.warn("Impossible to load predefinedGroovyScript.groovy", t);
			}
		} else if( "ECMAScript".equals(languageScript ) || "rhino-nonjdk".equals(languageScript ) ){
			imports = new ArrayList<Object>();
			URL url = Thread.currentThread().getContextClassLoader().getResource("predefinedJavascriptScript.js");
			try {
				logger.debug("predefinedJavascriptScript.js file URL is equal to [" + url + "]");			
				imports.add(url);
			} catch (Throwable t) {
				logger.warn("Impossible to load predefinedJavascriptScript.js", t);
			}	
		}  else {
			logger.debug("There is no predefined script file to import for scripting language [" + languageScript + "]");
		}
		
		SpagoBIScriptManager scriptManager = new SpagoBIScriptManager();
		result = (String)scriptManager.runScript(getScript(), languageScript, attributes, imports);   
		
		// check if the result must be converted into the right xml sintax
		boolean toconvert = checkSintax(result);
		if(toconvert) { 
			result = convertResult(result);
		}
		logger.debug("OUT");
		return result;
	}


	private String substituteProfileAttributes(String script, HashMap attributes) throws EMFInternalError{
		logger.debug("IN");
		String cleanScript=new String(script);
		int indexSubstitution=0;
		int profileAttributeStartIndex = script.indexOf("${",indexSubstitution);

		while (profileAttributeStartIndex != -1) {
			int profileAttributeEndIndex=script.indexOf("}",profileAttributeStartIndex);
			String attributeName = script.substring(profileAttributeStartIndex + 2, profileAttributeEndIndex).trim();
			Object attributeValueObj = attributes.get(attributeName);
			if(attributeValueObj==null)
			{
				logger.error("Profile attribute "+attributeName+" not found");
				attributeValueObj="undefined";
			}
			cleanScript=cleanScript.replaceAll("\\$\\{"+attributeName+"\\}", attributeValueObj.toString());
			indexSubstitution=profileAttributeEndIndex;
			profileAttributeStartIndex = script.indexOf("${",indexSubstitution);
		}
		logger.debug("OUT");
		return cleanScript;	
	}


	/**
	 * checks if the result is formatted in the right xml structure
	 * @param result the result of the lov
	 * @return true if the result is formatted correctly false otherwise
	 */
	public boolean checkSintax(String result) {
		boolean toconvert = false;
		try{
			SourceBean source = SourceBean.fromXMLString(result);
			if(!source.getName().equalsIgnoreCase("ROWS")) {
				toconvert = true;
			} else {
				List rowsList = source.getAttributeAsList(DataRow.ROW_TAG);
				if( (rowsList==null) || (rowsList.size()==0) ) {
					toconvert = true;
				} else {
					// TODO this part can be moved to the import transformer
					// RESOLVES RETROCOMPATIBILITY PROBLEMS
					// finds the name of the first attribute of the rows if exists 
					String defaultName = "";
					SourceBean rowSB = (SourceBean) rowsList.get(0);
					List attributes = rowSB.getContainedAttributes();
					if (attributes != null && attributes.size() > 0) {
						SourceBeanAttribute attribute = (SourceBeanAttribute) attributes.get(0);
						defaultName = attribute.getKey();
					}
					// if a value column is specified, it is considered
					SourceBean valueColumnSB = (SourceBean) source.getAttribute("VALUE-COLUMN");
					if (valueColumnSB != null) {
						String valueColumn = valueColumnSB.getCharacters();
						if (valueColumn != null) {
							valueColumnName = valueColumn;
						}
					} else {
						valueColumnName = defaultName;
					}
					SourceBean visibleColumnsSB = (SourceBean) source.getAttribute("VISIBLE-COLUMNS");
					if (visibleColumnsSB != null) {
						String allcolumns = visibleColumnsSB.getCharacters();
						if (allcolumns != null) {
							String[] columns = allcolumns.split(",");
							visibleColumnNames = Arrays.asList(columns);
						}
					} else {
						String[] columns = new String[] {defaultName};
						visibleColumnNames = Arrays.asList(columns);
					}
					SourceBean descriptionColumnSB = (SourceBean) source.getAttribute("DESCRIPTION-COLUMN");
					if (descriptionColumnSB != null) {
						String descriptionColumn = descriptionColumnSB.getCharacters();
						if (descriptionColumn != null) {
							descriptionColumnName = descriptionColumn;
						}
					} else {
						descriptionColumnName = defaultName;
					}
				}
			}

		} catch (Exception e) {
			SpagoBITracer.warning(SpagoBIConstants.NAME_MODULE, this.getClass().getName(), 
					"checkSintax", "the result of the lov is not formatted " +
			"with the right structure so it will be wrapped inside an xml envelope");
			toconvert = true;
		}
		return toconvert;
	}

	/**
	 * Gets the list of names of the profile attributes required.
	 * 
	 * @return list of profile attribute names
	 * 
	 * @throws Exception the exception
	 */
//	public List getProfileAttributeNames() throws Exception {
//	List names = new ArrayList();
//	String script = getScript();
//	while(script.indexOf("getSingleValueProfileAttribute(")!=-1) {
//	int startind = script.indexOf("getSingleValueProfileAttribute(");
//	int endind = startind + 31;
//	int parind = script.indexOf(")", endind);
//	String name = script.substring(endind, parind);
//	script = script.substring(0, startind) + script.substring(parind+1);
//	names.add(name);
//	}
//	while(script.indexOf("getMultiValueProfileAttribute(")!=-1) {
//	int startind = script.indexOf("getMultiValueProfileAttribute(");
//	int endind = startind + 30;
//	int comaind = script.indexOf(",", endind);
//	String name = script.substring(endind, comaind);
//	script = script.substring(0, startind) + script.substring(comaind+1);
//	names.add(name);
//	}
//	return names;
//	}




	/**
	 * Gets the list of names of the profile attributes required.
	 * 
	 * @return list of profile attribute names
	 * 
	 * @throws Exception the exception
	 */
	public List getProfileAttributeNames() throws Exception {
		List names = new ArrayList();
		String script = getScript();
		while(script.indexOf("${")!=-1) {
			int startind = script.indexOf("${");
			int endind = script.indexOf("}", startind);
			String attributeDef = script.substring(startind + 2, endind);
			if(attributeDef.indexOf("(")!=-1) {
				int indroundBrack = script.indexOf("(", startind);
				String nameAttr = script.substring(startind+2, indroundBrack);
				names.add(nameAttr);
			} else {
				names.add(attributeDef);
			}
			script = script.substring(endind);
		}
		return names;
	}




















	/**
	 * Checks if the lov requires one or more profile attributes.
	 * 
	 * @return true if the lov require one or more profile attributes, false otherwise
	 * 
	 * @throws Exception the exception
	 */
	public boolean requireProfileAttributes() throws Exception {
		boolean contains = false;
		String script = getScript();
		if(script.indexOf("getSingleValueProfileAttribute(")!=-1){
			contains = true;
		}
		if(script.indexOf("getMultiValueProfileAttribute(")!=-1){
			contains = true;
		}
		return contains;
	}	


	/**
	 * In case the result of the string is not structured as expected  
	 * wrap the result into the right xml envelope
	 * @param result the result of the script
	 * @return
	 */
	public String convertResult(String result) {
		StringBuffer sb = new StringBuffer();
		sb.append("<ROWS>");
		sb.append("<ROW VALUE=\"" + result +"\"/>");
		sb.append("</ROWS>");
		descriptionColumnName = "VALUE";
		valueColumnName = "VALUE";
		String [] visibleColumnNamesArray = new String [] {"VALUE"};
		visibleColumnNames = Arrays.asList(visibleColumnNamesArray);
		return sb.toString();
	}


	/**
	 * Get the string of the script.
	 * 
	 * @return The string of the script
	 */
	public String getScript() {
		return script;
	}

	/**
	 * Set the string of the script.
	 * 
	 * @param script the string of the script
	 */
	public void setScript(String script) {
		this.script = script;
	}

	/**
	 * Splits an XML string by using some <code>SourceBean</code> object methods
	 * in order to obtain the source <code>ScriptDetail</code> objects whom XML has been
	 * built.
	 * 
	 * @param dataDefinition The XML input String
	 * 
	 * @return The corrispondent <code>ScriptDetail</code> object
	 * 
	 * @throws SourceBeanException If a SourceBean Exception occurred
	 */
	public static ScriptDetail fromXML (String dataDefinition) throws SourceBeanException {
		ScriptDetail scriptDet = new ScriptDetail(dataDefinition);
		return scriptDet;
	}



	/* (non-Javadoc)
	 * @see it.eng.spagobi.behaviouralmodel.lov.bo.ILovDetail#getDescriptionColumnName()
	 */
	public String getDescriptionColumnName() {
		return descriptionColumnName;
	}

	/* (non-Javadoc)
	 * @see it.eng.spagobi.behaviouralmodel.lov.bo.ILovDetail#setDescriptionColumnName(java.lang.String)
	 */
	public void setDescriptionColumnName(String descriptionColumnName) {
		this.descriptionColumnName = descriptionColumnName;
	}

	/* (non-Javadoc)
	 * @see it.eng.spagobi.behaviouralmodel.lov.bo.ILovDetail#getInvisibleColumnNames()
	 */
	public List getInvisibleColumnNames() {
		return invisibleColumnNames;
	}

	/* (non-Javadoc)
	 * @see it.eng.spagobi.behaviouralmodel.lov.bo.ILovDetail#setInvisibleColumnNames(java.util.List)
	 */
	public void setInvisibleColumnNames(List invisibleColumnNames) {
		this.invisibleColumnNames = invisibleColumnNames;
	}

	/* (non-Javadoc)
	 * @see it.eng.spagobi.behaviouralmodel.lov.bo.ILovDetail#getValueColumnName()
	 */
	public String getValueColumnName() {
		return valueColumnName;
	}

	/* (non-Javadoc)
	 * @see it.eng.spagobi.behaviouralmodel.lov.bo.ILovDetail#setValueColumnName(java.lang.String)
	 */
	public void setValueColumnName(String valueColumnName) {
		this.valueColumnName = valueColumnName;
	}

	/* (non-Javadoc)
	 * @see it.eng.spagobi.behaviouralmodel.lov.bo.ILovDetail#getVisibleColumnNames()
	 */
	public List getVisibleColumnNames() {
		return visibleColumnNames;
	}

	/* (non-Javadoc)
	 * @see it.eng.spagobi.behaviouralmodel.lov.bo.ILovDetail#setVisibleColumnNames(java.util.List)
	 */
	public void setVisibleColumnNames(List visibleColumnNames) {
		this.visibleColumnNames = visibleColumnNames;
	}

	public String getLanguageScript() {
		return languageScript;
	}

	public void setLanguageScript(String languageScript) {
		this.languageScript = languageScript;
	}




}