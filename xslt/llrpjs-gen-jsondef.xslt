<?xml version="1.0" encoding="UTF-8"?>
<!-- This file converts LLRP binary encoding definition files to JSON that can be used by the llrp.js library-->

<xsl:stylesheet version='1.0'
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:llrpdef="http://www.llrp.org/ltk/schema/core/encoding/binary/1.0">
    <xsl:output omit-xml-declaration='yes' method='text' encoding='iso-8859-1' />

    <!-- top template-->
    <xsl:template match="llrpdef:llrpdef">
{
        <xsl:call-template name="header"/>,
        <xsl:call-template name="namespaceDefinitions"/>,
    
        <xsl:call-template name="vendorDefinitions"/>,

        <xsl:call-template name="parameterDefinitions"/>,
        <xsl:call-template name="choiceDefinitions"/>,
        <xsl:call-template name="enumerationDefinitions"/>,
        <xsl:call-template name="messageDefinitions"/>,

        <xsl:call-template name="customParameterDefinitions"/>,
        <xsl:call-template name="customChoiceDefinitions"/>,
        <xsl:call-template name="customEnumerationDefinitions"/>,
        <xsl:call-template name="customMessageDefinitions"/>

        <xsl:call-template name="trailer"/>
}
    </xsl:template>

    <xsl:template name="header">
    "$comment": "Generated file (source: <xsl:value-of select="namespace-uri()"/>)",
    "title": "LLRP Binary Definition",
    "description": "A Low-Level Reader Protocol (LLRP) Message JSON binary definition"
    </xsl:template>

    <xsl:template name="trailer"></xsl:template>

    <xsl:template name="namespaceDefinitions">
        "namespaceDefinitions": [
            {
                "prefix": "<xsl:value-of select="llrpdef:namespaceDefinition/@prefix"/>",
                "URI": "<xsl:value-of select="llrpdef:namespaceDefinition/@URI"/>",
                "schemaLocation": "<xsl:value-of select="llrpdef:namespaceDefinition/@schemaLocation"/>"
            }
        ]
    </xsl:template>

    <xsl:template name="vendorDefinitions">
        "vendorDefinitions": [
        <xsl:for-each select="llrpdef:vendorDefinition">
            {
                "name": "<xsl:value-of select="./@name"/>",
                "vendorID": "<xsl:value-of select="./@vendorID"/>"
            }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
        ]
    </xsl:template>

    <xsl:template name="parameterDefinitions">
        "parameterDefinitions": [
        <xsl:for-each select="llrpdef:parameterDefinition">
            {
                "name": "<xsl:value-of select="@name"/>",
                "typeNum": "<xsl:value-of select="@typeNum"/>",
                "required": "<xsl:value-of select="@required"/>",
                "body": [
                    <xsl:call-template name="definitionContent"/>
                ]
            }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
        ]
    </xsl:template>

    <xsl:template name="choiceDefinitions">
        "choiceDefinitions": [
        <xsl:for-each select="llrpdef:choiceDefinition">
            {
                "name": "<xsl:value-of select="@name"/>",
                "body": [
                    <xsl:call-template name="definitionContent"/>
                ]
            }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
        ]
    </xsl:template>

    <xsl:template name="enumerationDefinitions">
        "enumerationDefinitions": [
        <xsl:for-each select="llrpdef:enumerationDefinition">
            {
                "name": "<xsl:value-of select="@name"/>",
                "entry": [
                    <xsl:call-template name="definitionContent"/>
                ]
            }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
        ]
    </xsl:template>

    <xsl:template name="messageDefinitions">
        "messageDefinitions": [
        <xsl:for-each select="llrpdef:messageDefinition">
            {
                "name": "<xsl:value-of select="@name"/>",
                "typeNum": "<xsl:value-of select="@typeNum"/>",
                "required": "<xsl:value-of select="@required"/>",
                "responseType": <xsl:choose>
                    <xsl:when test="@responseType">"<xsl:value-of select="@responseType"/>"</xsl:when>
                    <xsl:otherwise>null</xsl:otherwise>
                </xsl:choose>,
                "body": [
                    <xsl:call-template name="definitionContent"/>
                ]
            }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
        ]
    </xsl:template>

    <!-- custom definitions-->

    <xsl:template name="customParameterDefinitions">
        "customParameterDefinitions": [
        <xsl:for-each select="llrpdef:customParameterDefinition">
            {
                "name": "<xsl:value-of select="@name"/>",
                "vendor": "<xsl:value-of select="@vendor"/>",
                "subtype": "<xsl:value-of select="@subtype"/>",
                "namespace": "<xsl:value-of select="@namespace"/>",
                "body": [
                    <xsl:call-template name="definitionContent"/>
                ]
            }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
        ]
    </xsl:template>

    <xsl:template name="customChoiceDefinitions">
        "customChoiceDefinitions": [
        <xsl:for-each select="llrpdef:customChoiceDefinition">
            {
                "name": "<xsl:value-of select="@name"/>",
                "namespace": "<xsl:value-of select="@namespace"/>",
                "body": [
                    <xsl:call-template name="definitionContent"/>
                ]
            }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
        ]
    </xsl:template>

    <xsl:template name="customEnumerationDefinitions">
        "customEnumerationDefinitions": [
        <xsl:for-each select="llrpdef:customEnumerationDefinition">
            {
                "name": "<xsl:value-of select="@name"/>",
                "namespace": "<xsl:value-of select="@namespace"/>",
                "entry": [
                    <xsl:call-template name="definitionContent"/>
                ]
            }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
        ]
    </xsl:template>

    <xsl:template name="customMessageDefinitions">
        "customMessageDefinitions": [
        <xsl:for-each select="llrpdef:customMessageDefinition">
            {
                "name": "<xsl:value-of select="@name"/>",
                "vendor": "<xsl:value-of select="@vendor"/>",
                "subtype": "<xsl:value-of select="@subtype"/>",
                "namespace": "<xsl:value-of select="@namespace"/>",
                "responseType": <xsl:choose>
                    <xsl:when test="@responseType">"<xsl:value-of select="@responseType"/>"</xsl:when>
                    <xsl:otherwise>null</xsl:otherwise>
                </xsl:choose>,
                "body": [
                    <xsl:call-template name="definitionContent"/>
                ]
            }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
        ]
    </xsl:template>

    <xsl:template name="definitionContent">
        <xsl:for-each select="./*[name() != 'annotation']">
        {
            <xsl:apply-templates select="."/>
        }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
    </xsl:template>

    <xsl:template match="llrpdef:*/*[(name() = 'parameter') or (name() = 'choice')]">
            "node": "<xsl:value-of select="name()"/>",
            "type": "<xsl:value-of select="@type"/>"<xsl:if test="@repeat">,
            "repeat": "<xsl:value-of select="@repeat"/>"
            </xsl:if>
    </xsl:template>

    <xsl:template match="llrpdef:*/*[name() = 'entry']">
            "node": "entry",
            "name": "<xsl:value-of select="@name"/>",
            "value": "<xsl:value-of select="@value"/>"
    </xsl:template>
    
    <xsl:template match="llrpdef:*/*[name() = 'field']">
            "node": "field",
            "name": "<xsl:value-of select="@name"/>",
            "type": "<xsl:value-of select="@type"/>"<xsl:if test="@enumeration">,
            "enumeration": "<xsl:value-of select="@enumeration"/>"</xsl:if><xsl:if test="@format">,
            "format": "<xsl:value-of select="@format"/>"</xsl:if>
    </xsl:template>

    <xsl:template match="llrpdef:*/*[name() = 'reserved']">
            "node": "reserved",
            "bitCount": "<xsl:value-of select="@bitCount"/>"
    </xsl:template>

    <xsl:template match="llrpdef:*/*[name() = 'allowedIn']">
            "node": "allowedIn",
            "type": "<xsl:value-of select="@type"/>",
            "repeat": "<xsl:value-of select="@repeat"/>"
    </xsl:template>

</xsl:stylesheet>