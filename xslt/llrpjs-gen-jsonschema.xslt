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
    "id": "llrp-1x0.json",
    "title": "LLRP Message Schema",
    "description": "A Low-Level Reader Protocol (LLRP) Message JSONSchema",
    "type": "object"
    </xsl:template>

    <xsl:template name="definitions">
    "definitions": {
        "Message": {
            "type": "object",
            "properties": {
                "MessageID": {"$ref": "#/definitions/Types/UnsignedInt"},
                "MessageType": {
                    "type": "string"
                },
                "MessageBody": {
                    "type": "object"
                }
            },
            "required": ["MessageID", "MessageType", "MessageBody"]
        },
        "Types": {
            "Bit": {
                "anyOf": [
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
            "TwoBit": {
                "type": "integer",
                "minimum": 0,
                "maximum": 3
            },
            "BitArray": {
                "type": "array",
                "items": {"$ref": "#/definitions/Types/Bit"}
            },
            "UnsignedByte": {
                "type": "integer",
                "minimum": 0,
                "maximum": 255
            },
            "UnsignedByteArray": {
                "type": "array",
                "items": {"$ref": "#/definitions/Types/UnsignedByte"}
            },
            "Byte": {
                "type": "integer",
                "minimum": -128,
                "maximum": 127
            },
            "ByteArray": {
                "type": "array",
                "items": {"$ref": "#/definitions/Types/Byte"}
            },
            "UnsignedShort" : {
                "type": "integer",
                "minimum": 0,
                "maximum": 65535
            },
            "Short" : {
                "type": "integer",
                "minimum": -32768,
                "maximum": 32767
            },
            "UnsignedShortArray": {
                "type": "array",
                "items": {"$ref": "#/definitions/Types/UnsignedShort"}
            },
            "ShortArray": {
                "type": "array",
                "items": {"$ref": "#/definitions/Types/Short"}
            },
            "UnsignedInt" : {
                "type": "integer",
                "minimum": 0,
                "maximum": 4294967295
            },
            "Int" : {
                "type": "integer",
                "minimum": -2147483648,
                "maximum": 2147483647
            },
            "UnsignedIntArray": {
                "type": "array",
                "items": {"$ref": "#/definitions/Types/UnsignedInt"}
            },
            "IntArray": {
                "type": "array",
                "items": {"$ref": "#/definitions/Types/Int"}
            },
            "UnsignedInt64": {
                "type": "integer",
                "minimum": 0,
                "maximum": 18446744073709551615
            },
            "Int64": {
                "type": "integer",
                "minimum": -9223372036854775808,
                "maximum": 9223372036854775807
            },
            "UnsignedInt64Array": {
                "type": "array",
                "items": {"$ref": "#/definitions/Types/UnsignedInt64"}
            },
            "Int64Array": {
                "type": "array",
                "items": {"$ref": "#/definitions/Types/Int64"}
            },
            "UnsignedInt96": {
                "type": "integer",
                "minimum": 0,
                "maximum": 79228162514264337593543950335
            },
            "U96HexString": {
                "type": "string",
                "minLength": 24,
                "maxLength": 24,
                "pattern": "^[a-fA-F0-9]+$"
            },
            "HexString": {
                "type": "string",
                "minLength": 2,
                "maxLength": 131072,
                "pattern": "^[a-fA-F0-9]+$"
            },
            "DateTime": {
                "type": "string",
                "format": "date-time"
            },
            "BytesToEnd": {"$ref": "#/definitions/Types/UnsignedByteArray"}
        },
        <xsl:call-template name="parameterDefinitions"/>,
        <xsl:call-template name="enumerationDefinitions"/>,
        <xsl:call-template name="messageDefinitions"/>
    }
    </xsl:template>

    <xsl:template name="topLevelProperties">
    "allOf": [
        {"$ref": "#/definitions/Message"},
        {
            "oneOf": [
                <xsl:for-each select="llrpdef:messageDefinition">
                {
                    "properties": {
                        "MessageType": { "const": "<xsl:value-of select="@name"/>" },
                        "MessageBody": { "$ref": "#/definitions/Messages/<xsl:value-of select="@name"/>"}
                    }
                }<xsl:if test="position() != last()">,</xsl:if>
                </xsl:for-each>
            ]
        }
    ]
    </xsl:template>

    <!-- parameters-->
    <xsl:template name="parameterDefinitions">
        "Parameters": {<xsl:for-each select="llrpdef:parameterDefinition">
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
        "Enumerations": {<xsl:for-each select="llrpdef:enumerationDefinition">
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
        "Messages": {<xsl:for-each select='llrpdef:messageDefinition'>
            "<xsl:value-of select="@name"/>": {
                "properties": {
                    <xsl:call-template name="resolveReferences"/>
                }<xsl:if test="./*[(name() = 'field') or ((name() = 'parameter') and ((@repeat='1') or (@repeat='1-N')))]">
                ,"required": [
                    <xsl:call-template name="requiredFieldsParameters"/>
                ]</xsl:if><xsl:if test="./*[(name() = 'choice') and ((@repeat='1') or (@repeat='1-N'))]">
                ,"allOf": [
                    <xsl:call-template name="requiredChoices"></xsl:call-template>
                ]</xsl:if>
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
            "anyOf": [
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
                        "$ref": "#/definitions/Parameters/<xsl:value-of select="@type"/>"
                    </xsl:when>
                    <xsl:when test="($repeat='0-N') or ($repeat='1-N')">
                            "oneOf": [
                                {
                                    "type": "array",
                                    "items": {"$ref": "#/definitions/Parameters/<xsl:value-of select="@type"/>"}
                                },
                                {"$ref": "#/definitions/Parameters/<xsl:value-of select="@type"/>"}
                            ]
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
                    "$ref": "#/definitions/Parameters/<xsl:value-of select="@type"/>"
                </xsl:when>
                <xsl:when test="(@repeat='0-N') or (@repeat='1-N')">
                        "oneOf": [
                            {
                                "type": "array",
                                "items": {"$ref": "#/definitions/Parameters/<xsl:value-of select="@type"/>"}
                            },
                            {"$ref": "#/definitions/Parameters/<xsl:value-of select="@type"/>"}
                        ]
                </xsl:when>
            </xsl:choose>
        }
    </xsl:template>

    <!-- template for each field in a messageDefinition and parameterDefinition (sub-parameter)-->
    <xsl:template match="llrpdef:messageDefinition/*[name()='field'] | llrpdef:parameterDefinition/*[name()='field']">
        "<xsl:value-of select="@name"/>": <xsl:choose>
            <xsl:when test="not(@enumeration)">
                <xsl:choose>
                    <xsl:when test="(@type='u96') and (@format = 'Hex')">{"$ref": "#/definitions/Types/U96HexString"}</xsl:when>
                    <xsl:when test="@format = 'Hex'">{"$ref": "#/definitions/Types/HexString"}</xsl:when>
                    <xsl:when test="@format = 'Datetime'">{"$ref": "#/definitions/Types/DateTime"}</xsl:when>

                    <xsl:when test="@type='u1'">{"$ref": "#/definitions/Types/Bit"}</xsl:when>
                    <xsl:when test="@type='u2'">{"$ref": "#/definitions/Types/TwoBit"}</xsl:when>
                    <xsl:when test="@type='u1v'">{"$ref": "#/definitions/Types/BitArray"}</xsl:when>
                    <xsl:when test="@type='u8'">{"$ref": "#/definitions/Types/UnsignedByte"}</xsl:when>
                    <xsl:when test="@type='s8'">{"$ref": "#/definitions/Types/Byte"}</xsl:when>
                    <xsl:when test="@type='u8v'">{"$ref": "#/definitions/Types/UnsignedByteArray"}</xsl:when>
                    <xsl:when test="@type='s8v'">{"$ref": "#/definitions/Types/ByteArray"}</xsl:when>

                    <xsl:when test="@type='utf8v'">{"type": "string"}</xsl:when>
                    <xsl:when test="@type='u16'">{"$ref": "#/definitions/Types/UnsignedShort"}</xsl:when>
                    <xsl:when test="@type='s16'">{"$ref": "#/definitions/Types/Short"}</xsl:when>
                    <xsl:when test="@type='u16v'">{"$ref": "#/definitions/Types/UnsignedShortArray"}</xsl:when>
                    <xsl:when test="@type='s16v'">{"$ref": "#/definitions/Types/ShortArray"}</xsl:when>
                    <xsl:when test="@type='u32'">{"$ref": "#/definitions/Types/UnsignedInt"}</xsl:when>
                    <xsl:when test="@type='s32'">{"$ref": "#/definitions/Types/Int"}</xsl:when>
                    <xsl:when test="@type='u32v'">{"$ref": "#/definitions/Types/UnsignedIntArray"}</xsl:when>
                    <xsl:when test="@type='s32v'">{"$ref": "#/definitions/Types/IntArray"}</xsl:when>
                    <xsl:when test="@type='u64'">{"$ref": "#/definitions/Types/UnsignedInt64"}</xsl:when>
                    <xsl:when test="@type='s64'">{"$ref": "#/definitions/Types/Int64"}</xsl:when>
                    <xsl:when test="@type='u64v'">{"$ref": "#/definitions/Types/UnsignedInt64Array"}</xsl:when>
                    <xsl:when test="@type='s64v'">{"$ref": "#/definitions/Types/Int64Array"}</xsl:when>

                    <xsl:when test="@type='u96'">{"$ref": "#/definitions/Types/UnsignedInt96"}</xsl:when>

                    <xsl:when test="@type='bytesToEnd'">{"$ref": "#/definitions/Types/BytesToEnd"}</xsl:when>

                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>{"$ref": "#/definitions/Enumerations/<xsl:value-of select='@enumeration'/>"}</xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- template for each entry in an enumerationDefinition-->
    <xsl:template match="llrpdef:enumerationDefinition/*[name()='entry']">
        "<xsl:value-of select="@name"/>"
    </xsl:template>

</xsl:stylesheet>