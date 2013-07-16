/* SpagoBI, the Open Source Business Intelligence suite

 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
package it.eng.spagobi.community.mapping;

// Generated 15-lug-2013 11.45.55 by Hibernate Tools 3.4.0.CR1

import it.eng.spagobi.commons.metadata.SbiHibernateModel;

import java.util.Date;

/**
 * SbiCommunityUsers generated by hbm2java
 */
public class SbiCommunityUsers extends SbiHibernateModel {

	private SbiCommunityUsersId id;
	private SbiCommunity sbiCommunity;
	private Date creationDate;
	private Date lastChangeDate;
	private String userIn;
	private String userUp;
	private String userDe;
	private Date timeIn;
	private Date timeUp;
	private Date timeDe;
	private String sbiVersionIn;
	private String sbiVersionUp;
	private String sbiVersionDe;
	private String metaVersion;
	private String organization;

	public SbiCommunityUsers() {
	}

	public SbiCommunityUsers(SbiCommunityUsersId id, SbiCommunity sbiCommunity,
			Date creationDate, Date lastChangeDate, String userIn, Date timeIn) {
		this.id = id;
		this.sbiCommunity = sbiCommunity;
		this.creationDate = creationDate;
		this.lastChangeDate = lastChangeDate;
		this.userIn = userIn;
		this.timeIn = timeIn;
	}

	public SbiCommunityUsers(SbiCommunityUsersId id, SbiCommunity sbiCommunity,
			Date creationDate, Date lastChangeDate, String userIn,
			String userUp, String userDe, Date timeIn, Date timeUp,
			Date timeDe, String sbiVersionIn, String sbiVersionUp,
			String sbiVersionDe, String metaVersion, String organization) {
		this.id = id;
		this.sbiCommunity = sbiCommunity;
		this.creationDate = creationDate;
		this.lastChangeDate = lastChangeDate;
		this.userIn = userIn;
		this.userUp = userUp;
		this.userDe = userDe;
		this.timeIn = timeIn;
		this.timeUp = timeUp;
		this.timeDe = timeDe;
		this.sbiVersionIn = sbiVersionIn;
		this.sbiVersionUp = sbiVersionUp;
		this.sbiVersionDe = sbiVersionDe;
		this.metaVersion = metaVersion;
		this.organization = organization;
	}

	public SbiCommunityUsersId getId() {
		return this.id;
	}

	public void setId(SbiCommunityUsersId id) {
		this.id = id;
	}

	public SbiCommunity getSbiCommunity() {
		return this.sbiCommunity;
	}

	public void setSbiCommunity(SbiCommunity sbiCommunity) {
		this.sbiCommunity = sbiCommunity;
	}

	public Date getCreationDate() {
		return this.creationDate;
	}

	public void setCreationDate(Date creationDate) {
		this.creationDate = creationDate;
	}

	public Date getLastChangeDate() {
		return this.lastChangeDate;
	}

	public void setLastChangeDate(Date lastChangeDate) {
		this.lastChangeDate = lastChangeDate;
	}

	public String getUserIn() {
		return this.userIn;
	}

	public void setUserIn(String userIn) {
		this.userIn = userIn;
	}

	public String getUserUp() {
		return this.userUp;
	}

	public void setUserUp(String userUp) {
		this.userUp = userUp;
	}

	public String getUserDe() {
		return this.userDe;
	}

	public void setUserDe(String userDe) {
		this.userDe = userDe;
	}

	public Date getTimeIn() {
		return this.timeIn;
	}

	public void setTimeIn(Date timeIn) {
		this.timeIn = timeIn;
	}

	public Date getTimeUp() {
		return this.timeUp;
	}

	public void setTimeUp(Date timeUp) {
		this.timeUp = timeUp;
	}

	public Date getTimeDe() {
		return this.timeDe;
	}

	public void setTimeDe(Date timeDe) {
		this.timeDe = timeDe;
	}

	public String getSbiVersionIn() {
		return this.sbiVersionIn;
	}

	public void setSbiVersionIn(String sbiVersionIn) {
		this.sbiVersionIn = sbiVersionIn;
	}

	public String getSbiVersionUp() {
		return this.sbiVersionUp;
	}

	public void setSbiVersionUp(String sbiVersionUp) {
		this.sbiVersionUp = sbiVersionUp;
	}

	public String getSbiVersionDe() {
		return this.sbiVersionDe;
	}

	public void setSbiVersionDe(String sbiVersionDe) {
		this.sbiVersionDe = sbiVersionDe;
	}

	public String getMetaVersion() {
		return this.metaVersion;
	}

	public void setMetaVersion(String metaVersion) {
		this.metaVersion = metaVersion;
	}

	public String getOrganization() {
		return this.organization;
	}

	public void setOrganization(String organization) {
		this.organization = organization;
	}

}
