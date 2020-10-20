<?xml version="1.0" encoding="UTF-8"?>
<!--
    This XSLT file is used to generate a JSON schema from the original LLRP definition XML file

    I could have used the LLRP XML schema (XSD) file to generate a JSON schema yet I chose not to:
        1. I found that some vendors do not provide XML schemas along with their custom LLRP definitions file
        2. It seems like a good idea to generate binary encoding definitions, document schemas, and protocol
            documentation out of a single file

    Feel free to correct me :-)

    Haytham Halimeh <haytham.halimeh@gmail.com>
-->

<xsl:stylesheet version='1.0'
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:llrpdef="http://www.llrp.org/ltk/schema/core/encoding/binary/1.0">
    <xsl:output omit-xml-declaration='yes' method='text' encoding='iso-8859-1' />
    <!-- top template-->
    <xsl:template match="llrpdef:llrpdef">
{
        <xsl:call-template name="header"/>,
        <xsl:call-template name="definitions"/>,
        <xsl:call-template name="topLevelProperties"/>
        <xsl:call-template name="trailer"/>
}
    </xsl:template>

    <!-- output header-->
    <xsl:template name="header">
    "$comment": "Generated file (source: <xsl:value-of select="namespace-uri()"/>)",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "def.schema.json",
    "title": "LLRP Message Schema",
    "description": "Low-Level Reader Protocol (LLRP) Message Schema"
    </xsl:template>

    <xsl:template name="definitions">
    "definitions": {
        "types": {
            "u1": {
                "oneOf": [
                    {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 1
                    },
                    {
                        "type": "boolean"
                    }
                ]
            },
            "u2": {
                "type": "integer",
                "minimum": 0,
                "maximum": 3
            },
            "u1v": {
                "type": "array",
                "items": {"$ref": "#/definitions/types/u1"}
            },
            "u8": {
                "type": "integer",
                "minimum": 0,
                "maximum": 255
            },
            "u8v": {
                "type": "array",
                "items": {"$ref": "#/definitions/types/u8"}
            },
            "s8": {
                "type": "integer",
                "minimum": -128,
                "maximum": 127
            },
            "s8v": {
                "type": "array",
                "items": {"$ref": "#/definitions/types/s8"}
            },
            "u16" : {
                "type": "integer",
                "minimum": 0,
                "maximum": 65535
            },
            "s16" : {
                "type": "integer",
                "minimum": -32768,
                "maximum": 32767
            },
            "u16v": {
                "type": "array",
                "items": {"$ref": "#/definitions/types/u16"}
            },
            "s16v": {
                "type": "array",
                "items": {"$ref": "#/definitions/types/s16"}
            },
            "u32" : {
                "type": "integer",
                "minimum": 0,
                "maximum": 4294967295
            },
            "s32" : {
                "type": "integer",
                "minimum": -2147483648,
                "maximum": 2147483647
            },
            "u32v": {
                "type": "array",
                "items": {"$ref": "#/definitions/types/u32"}
            },
            "s32v": {
                "type": "array",
                "items": {"$ref": "#/definitions/types/s32"}
            },
            "u64": {
                "type": "integer",
                "minimum": 0,
                "maximum": 18446744073709551615
            },
            "s64": {
                "type": "integer",
                "minimum": -9223372036854775808,
                "maximum": 9223372036854775807
            },
            "u64v": {
                "type": "array",
                "items": {"$ref": "#/definitions/types/u64"}
            },
            "s64v": {
                "type": "array",
                "items": {"$ref": "#/definitions/types/s64"}
            },
            "u96": {
                "type": "array",
                "items": {"$ref": "#/definitions/types/u8"},
                "maxItems": 12
            },
            "u96Hexstring": {
                "type": "string",
                "minLength": 24,
                "maxLength": 24,
                "pattern": "^[a-fA-F0-9]+$"
            },
            "hexstring": {
                "type": "string",
                "minLength": 2,
                "maxLength": 131072,
                "pattern": "^[a-fA-F0-9]+$"
            },
            "datetime": {
                "type": "string",
                "format": "date-time"
            },
            "bytesToEnd": {"$ref": "#/definitions/types/u8v"}
        },
        "message": {
            "type": "object",
            "properties": {
                "MessageID": {
                    "$ref": "#/definitions/types/u32"
                },
                "MessageType": {
                    "type": "string",
                    "enum": [
                    <xsl:for-each select="llrpdef:messageDefinition">
                        "<xsl:value-of select="@name"/>"<xsl:if test="position() != last()">,</xsl:if>
                    </xsl:for-each>
                    ]
                },
                "MessageBody": {
                    "type": "object"
                }
            },
            "required": ["MessageID", "MessageType", "MessageBody"]
        },
        <xsl:call-template name="parameterDefinitions"/>,
        <xsl:call-template name="enumerationDefinitions"/>,
        <xsl:call-template name="messageDefinitions"/>
    }
    </xsl:template>

    <xsl:template name="topLevelProperties">
    "type": "object",
    "allOf": [
        {"$ref": "#/definitions/message"},
    <xsl:for-each select="llrpdef:messageDefinition">
        {
            "if": {
                "properties": {
                    "MessageType": {
                        "const": "<xsl:value-of select="@name"/>"
                    }
                }
            },
            "then": {
                "$ref": "#/definitions/messages/<xsl:value-of select="@name"/>"
            }
        }<xsl:if test="position() != last()">,</xsl:if>
    </xsl:for-each>
    ]
    </xsl:template>

    <!-- parameters-->
    <xsl:template name="parameterDefinitions">
        "parameters": {<xsl:for-each select="llrpdef:parameterDefinition">
            "<xsl:value-of select="@name"/>": {
                "type": "object",
                "properties": {
                    <xsl:call-template name="resolveReferences"/>
                }<xsl:if test="./*[(name() = 'field') or ((name() = 'parameter') and ((@repeat='1') or (@repeat='1-N')))]">
                ,"required": [
                    <xsl:call-template name="requiredFieldsParameters"/>
                ]</xsl:if><xsl:if test="./*[(name() = 'choice') and ((@repeat='1') or (@repeat='1-N'))]">
                ,"allOf": [
                    <xsl:call-template name="requiredChoices"></xsl:call-template>
                ]
                </xsl:if>
            }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
        }
    </xsl:template>

    <xsl:template name="enumerationDefinitions">
        "enumerations": {<xsl:for-each select="llrpdef:enumerationDefinition">
            "<xsl:value-of select="@name"/>": {
                "type": "string",
                "enum": [
                    <xsl:call-template name="resolveReferences"/>
                ]
            }<xsl:choose><xsl:when test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:when></xsl:choose>
        </xsl:for-each>
        }
    </xsl:template>

    <!-- messages-->
    <xsl:template name="messageDefinitions">
        "messages": {<xsl:for-each select='llrpdef:messageDefinition'>
            "<xsl:value-of select="@name"/>": {
                "properties": {
                    "MessageType": {
                        "const": "<xsl:value-of select="@name"/>"
                    },
                    "MessageBody": {
                        "properties": {
                            <xsl:call-template name="resolveReferences"/>
                        }
                        ,"additionalProperties": false<xsl:if test="./*[(name() = 'field') or ((name() = 'parameter') and ((@repeat='1') or (@repeat='1-N')))]">
                        ,"required": [
                            <xsl:call-template name="requiredFieldsParameters"/>
                        ]</xsl:if><xsl:if test="./*[(name() = 'choice') and ((@repeat='1') or (@repeat='1-N'))]">
                        ,"allOf": [
                            <xsl:call-template name="requiredChoices"></xsl:call-template>
                        ]</xsl:if>
                    }
                }
            }<xsl:if test="position() != last()">,</xsl:if>
        </xsl:for-each>
        }
    </xsl:template>

    <!-- output trailer-->
    <xsl:template name="trailer"></xsl:template>

    <!-- iterate message sub-elements-->
    <xsl:template name="resolveReferences">
        <xsl:for-each select="./*[(name()!='annotation') and (name() != 'reserved')]">
            <xsl:apply-templates select="." xml:space="preserve"/><xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
    </xsl:template>

    <!-- iterate message choice elements -->
    <xsl:template name="resolveChoiceReferences">
        <xsl:for-each select="./*[(name() = 'choice')]">
            <xsl:apply-templates select="."/><xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
    </xsl:template>

    <!-- iterate mandatory elements-->
    <xsl:template name="requiredFieldsParameters">
        <xsl:for-each select="./*[(name() = 'field') or ((name() = 'parameter') and ((@repeat='1') or (@repeat='1-N')))]">
            <xsl:choose>
                <xsl:when test="name() = 'field'">
                    "<xsl:value-of select="@name"/>"
                </xsl:when>
                <xsl:otherwise>
                    "<xsl:value-of select="@type"/>"
                </xsl:otherwise>
            </xsl:choose><xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="requiredChoices">
        <xsl:for-each select="./*[(name() = 'choice') and ((@repeat = '1') or (@repeat = '1-N'))]">
            <xsl:call-template name="requiredChoice">
                <xsl:with-param name="choiceName"><xsl:value-of select="@type"/></xsl:with-param>
                <xsl:with-param name="repeat"><xsl:value-of select="@repeat"/></xsl:with-param>
            </xsl:call-template><xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="requiredChoice">
        <xsl:param name="choiceName"/>
        <xsl:param name="repeat"/>
        {
            "oneOf": [
        <xsl:for-each select="//llrpdef:choiceDefinition[@name=$choiceName]/*[name()='parameter']">
                {
                    "required": ["<xsl:value-of select="@type"/>"]
                }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
            ]
        }
    </xsl:template>

    <!-- template for each choice in a messageDefinition and parameterDefinition (sub-parameter)-->
    <xsl:template match="llrpdef:messageDefinition/*[name()='choice'] | llrpdef:parameterDefinition/*[name()='choice']">
        <xsl:variable name="choiceName"><xsl:value-of select="@type"/></xsl:variable>
        <xsl:variable name="repeat"><xsl:value-of select="@repeat"/></xsl:variable>
        <xsl:variable name="hasCustom"><xsl:value-of select="./../*[@type='Custom']"/></xsl:variable>
        <xsl:for-each select="//llrpdef:choiceDefinition[@name=$choiceName]/*[((@type='Custom') and not($hasCustom)) or (@type!='Custom')]">
            "<xsl:value-of select="@type"/>": {
                <xsl:choose>
                    <xsl:when test="($repeat='0-1')or ($repeat='1')">
                        "$ref": "#/definitions/parameters/<xsl:value-of select="@type"/>"
                    </xsl:when>
                    <xsl:when test="($repeat='0-N') or ($repeat='1-N')">
                            "if": {
                                "type": "array"
                            },
                            "then": {
                                    "type": "array",
                                    "items": {"$ref": "#/definitions/parameters/<xsl:value-of select="@type"/>"}
                            },
                            "else": {"$ref": "#/definitions/parameters/<xsl:value-of select="@type"/>"}
                    </xsl:when>
                </xsl:choose>
            }<xsl:if test="position() != last()"><xsl:text>,&#xa;</xsl:text></xsl:if>
        </xsl:for-each>
    </xsl:template>

    <!-- template for each parameter in a messageDefinition and parameterDefinition (sub-parameter)-->
    <xsl:template match="llrpdef:messageDefinition/*[name()='parameter'] | llrpdef:parameterDefinition/*[name()='parameter']">
        "<xsl:value-of select="@type"/>": {
            <xsl:choose>
                <xsl:when test="(@repeat='0-1')or (@repeat='1')">
                    "$ref": "#/definitions/parameters/<xsl:value-of select="@type"/>"
                </xsl:when>
                <xsl:when test="(@repeat='0-N') or (@repeat='1-N')">
                        "if": {
                            "type": "array"
                        },
                        "then": {
                                "type": "array",
                                "items": {"$ref": "#/definitions/parameters/<xsl:value-of select="@type"/>"}
                        },
                        "else": {"$ref": "#/definitions/parameters/<xsl:value-of select="@type"/>"}
                </xsl:when>
            </xsl:choose>
        }
    </xsl:template>

    <!-- template for each field in a messageDefinition and parameterDefinition (sub-parameter)-->
    <xsl:template match="llrpdef:messageDefinition/*[name()='field'] | llrpdef:parameterDefinition/*[name()='field']">
        "<xsl:value-of select="@name"/>": <xsl:choose>
            <xsl:when test="not(@enumeration)">
                <xsl:choose>
                    <xsl:when test="(@type='u96') and (@format = 'Hex')">{"$ref": "#/definitions/types/u96Hexstring"}</xsl:when>
                    <xsl:when test="@format = 'Hex'">{"$ref": "#/definitions/types/hexstring"}</xsl:when>
                    <xsl:when test="@format = 'Datetime'">{"$ref": "#/definitions/types/datetime"}</xsl:when>
                    <xsl:when test="@type='utf8v'">{"type": "string"}</xsl:when>

                    <xsl:otherwise>{"$ref": "#/definitions/types/<xsl:value-of select="@type"/>"}</xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>{"$ref": "#/definitions/enumerations/<xsl:value-of select='@enumeration'/>"}</xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- template for each entry in an enumerationDefinition-->
    <xsl:template match="llrpdef:enumerationDefinition/*[name()='entry']">
        "<xsl:value-of select="@name"/>"
    </xsl:template>

</xsl:stylesheet>