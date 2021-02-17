
/**
 * Generated file - DO NOT EDIT
 * 
 * source: http://www.llrp.org/ltk/schema/core/encoding/binary/1.0
 * 
 * LLRP Data Types and Classes
 */

// Generics:
import { LLRPMessage } from "./LLRPMessage";

// base types
type BOOL = 0 | 1 | boolean;
type CRUMB = 0 | 1 | 2 | 3;

// Creates an args type with message id and message-specific data to be used message classes.
type GetCtrArgs<T extends LLRPMessage<any>> = Omit<T['origin']['LLRPMESSAGETYPE'], "type">;
// an array type of 1-N repeat
type NonEmptyArray<T> = [T, ...T[]];

// Parameter: 1
type ParamOnlyOnce<T> = Required<T>;
// Parameter: 1-N
type ParamAtLeastOnce<T, Keys extends keyof T = keyof T> = {
    [K in Keys]: T[K] | NonEmptyArray<T[K]>;
};
// Parameter: 0-N
type ParamMultipleOptional<T, Keys extends keyof T = keyof T> = {
    [K in Keys]?: T[K] | NonEmptyArray<T[K]>;
};
// Parameter: 0-1
type ParameterOnceAtMost<T> = Partial<T>;

// Choice: 1-N
type ChoiceAtLeastOnce<T, Keys extends keyof T = keyof T> = {
    [K in Keys]-?:
    Required<ParamAtLeastOnce<Pick<T, K>>>
    & Partial<ParamAtLeastOnce<Pick<T, Exclude<Keys, K>>>>
}[Keys];
// Choice: 0-N
type ChoiceMultipleOptional<T> = ChoiceAtLeastOnce<T> | {
    [K in keyof T]?: undefined
}
// Choice: 1
type ChoiceOnlyOnce<T, Keys extends keyof T = keyof T> = {
    [K in Keys]-?:
    Required<Pick<T, K>>
    & Partial<Record<Exclude<Keys, K>, undefined>>
}[Keys];
// Choice: 0-1
type ChoiceOnceAtMost<T> = ChoiceOnlyOnce<T> | {
    [K in keyof T]?: undefined
}

// Generics end


// Enumerations

type LLRP_E_AirProtocols =
    "Unspecified" |
    "EPCGlobalClass1Gen2";

type LLRP_E_GetReaderCapabilitiesRequestedData =
    "All" |
    "General_Device_Capabilities" |
    "LLRP_Capabilities" |
    "Regulatory_Capabilities" |
    "LLRP_Air_Protocol_Capabilities";

type LLRP_E_CommunicationsStandard =
    "Unspecified" |
    "US_FCC_Part_15" |
    "ETSI_302_208" |
    "ETSI_300_220" |
    "Australia_LIPD_1W" |
    "Australia_LIPD_4W" |
    "Japan_ARIB_STD_T89" |
    "Hong_Kong_OFTA_1049" |
    "Taiwan_DGT_LP0002" |
    "Korea_MIC_Article_5_2";

type LLRP_E_ROSpecState =
    "Disabled" |
    "Inactive" |
    "Active";

type LLRP_E_ROSpecStartTriggerType =
    "Null" |
    "Immediate" |
    "Periodic" |
    "GPI";

type LLRP_E_ROSpecStopTriggerType =
    "Null" |
    "Duration" |
    "GPI_With_Timeout";

type LLRP_E_AISpecStopTriggerType =
    "Null" |
    "Duration" |
    "GPI_With_Timeout" |
    "Tag_Observation";

type LLRP_E_TagObservationTriggerType =
    "Upon_Seeing_N_Tags_Or_Timeout" |
    "Upon_Seeing_No_More_New_Tags_For_Tms_Or_Timeout" |
    "N_Attempts_To_See_All_Tags_In_FOV_Or_Timeout";

type LLRP_E_RFSurveySpecStopTriggerType =
    "Null" |
    "Duration" |
    "N_Iterations_Through_Frequency_Range";

type LLRP_E_AccessSpecState =
    "Disabled" |
    "Active";

type LLRP_E_AccessSpecStopTriggerType =
    "Null" |
    "Operation_Count";

type LLRP_E_GetReaderConfigRequestedData =
    "All" |
    "Identification" |
    "AntennaProperties" |
    "AntennaConfiguration" |
    "ROReportSpec" |
    "ReaderEventNotificationSpec" |
    "AccessReportSpec" |
    "LLRPConfigurationStateValue" |
    "KeepaliveSpec" |
    "GPIPortCurrentState" |
    "GPOWriteData" |
    "EventsAndReports";

type LLRP_E_IdentificationType =
    "MAC_Address" |
    "EPC";

type LLRP_E_KeepaliveTriggerType =
    "Null" |
    "Periodic";

type LLRP_E_GPIPortState =
    "Low" |
    "High" |
    "Unknown";

type LLRP_E_ROReportTriggerType =
    "None" |
    "Upon_N_Tags_Or_End_Of_AISpec" |
    "Upon_N_Tags_Or_End_Of_ROSpec";

type LLRP_E_AccessReportTriggerType =
    "Whenever_ROReport_Is_Generated" |
    "End_Of_AccessSpec";

type LLRP_E_NotificationEventType =
    "Upon_Hopping_To_Next_Channel" |
    "GPI_Event" |
    "ROSpec_Event" |
    "Report_Buffer_Fill_Warning" |
    "Reader_Exception_Event" |
    "RFSurvey_Event" |
    "AISpec_Event" |
    "AISpec_Event_With_Details" |
    "Antenna_Event";

type LLRP_E_ROSpecEventType =
    "Start_Of_ROSpec" |
    "End_Of_ROSpec" |
    "Preemption_Of_ROSpec";

type LLRP_E_RFSurveyEventType =
    "Start_Of_RFSurvey" |
    "End_Of_RFSurvey";

type LLRP_E_AISpecEventType =
    "End_Of_AISpec";

type LLRP_E_AntennaEventType =
    "Antenna_Disconnected" |
    "Antenna_Connected";

type LLRP_E_ConnectionAttemptStatusType =
    "Success" |
    "Failed_A_Reader_Initiated_Connection_Already_Exists" |
    "Failed_A_Client_Initiated_Connection_Already_Exists" |
    "Failed_Reason_Other_Than_A_Connection_Already_Exists" |
    "Another_Connection_Attempted";

type LLRP_E_StatusCode =
    "M_Success" |
    "M_ParameterError" |
    "M_FieldError" |
    "M_UnexpectedParameter" |
    "M_MissingParameter" |
    "M_DuplicateParameter" |
    "M_OverflowParameter" |
    "M_OverflowField" |
    "M_UnknownParameter" |
    "M_UnknownField" |
    "M_UnsupportedMessage" |
    "M_UnsupportedVersion" |
    "M_UnsupportedParameter" |
    "P_ParameterError" |
    "P_FieldError" |
    "P_UnexpectedParameter" |
    "P_MissingParameter" |
    "P_DuplicateParameter" |
    "P_OverflowParameter" |
    "P_OverflowField" |
    "P_UnknownParameter" |
    "P_UnknownField" |
    "P_UnsupportedParameter" |
    "A_Invalid" |
    "A_OutOfRange" |
    "R_DeviceError";

type LLRP_E_C1G2DRValue =
    "DRV_8" |
    "DRV_64_3";

type LLRP_E_C1G2MValue =
    "MV_FM0" |
    "MV_2" |
    "MV_4" |
    "MV_8";

type LLRP_E_C1G2ForwardLinkModulation =
    "PR_ASK" |
    "SSB_ASK" |
    "DSB_ASK";

type LLRP_E_C1G2SpectralMaskIndicator =
    "Unknown" |
    "SI" |
    "MI" |
    "DI";

type LLRP_E_C1G2TruncateAction =
    "Unspecified" |
    "Do_Not_Truncate" |
    "Truncate";

type LLRP_E_C1G2StateAwareTarget =
    "SL" |
    "Inventoried_State_For_Session_S0" |
    "Inventoried_State_For_Session_S1" |
    "Inventoried_State_For_Session_S2" |
    "Inventoried_State_For_Session_S3";

type LLRP_E_C1G2StateAwareAction =
    "AssertSLOrA_DeassertSLOrB" |
    "AssertSLOrA_Noop" |
    "Noop_DeassertSLOrB" |
    "NegateSLOrABBA_Noop" |
    "DeassertSLOrB_AssertSLOrA" |
    "DeassertSLOrB_Noop" |
    "Noop_AssertSLOrA" |
    "Noop_NegateSLOrABBA";

type LLRP_E_C1G2StateUnawareAction =
    "Select_Unselect" |
    "Select_DoNothing" |
    "DoNothing_Unselect" |
    "Unselect_DoNothing" |
    "Unselect_Select" |
    "DoNothing_Select";

type LLRP_E_C1G2TagInventoryStateAwareI =
    "State_A" |
    "State_B";

type LLRP_E_C1G2TagInventoryStateAwareS =
    "SL" |
    "Not_SL";

type LLRP_E_C1G2LockPrivilege =
    "Read_Write" |
    "Perma_Lock" |
    "Perma_Unlock" |
    "Unlock";

type LLRP_E_C1G2LockDataField =
    "Kill_Password" |
    "Access_Password" |
    "EPC_Memory" |
    "TID_Memory" |
    "User_Memory";

type LLRP_E_C1G2ReadResultType =
    "Success" |
    "Nonspecific_Tag_Error" |
    "No_Response_From_Tag" |
    "Nonspecific_Reader_Error";

type LLRP_E_C1G2WriteResultType =
    "Success" |
    "Tag_Memory_Overrun_Error" |
    "Tag_Memory_Locked_Error" |
    "Insufficient_Power" |
    "Nonspecific_Tag_Error" |
    "No_Response_From_Tag" |
    "Nonspecific_Reader_Error";

type LLRP_E_C1G2KillResultType =
    "Success" |
    "Zero_Kill_Password_Error" |
    "Insufficient_Power" |
    "Nonspecific_Tag_Error" |
    "No_Response_From_Tag" |
    "Nonspecific_Reader_Error";

type LLRP_E_C1G2LockResultType =
    "Success" |
    "Insufficient_Power" |
    "Nonspecific_Tag_Error" |
    "No_Response_From_Tag" |
    "Nonspecific_Reader_Error";

type LLRP_E_C1G2BlockEraseResultType =
    "Success" |
    "Tag_Memory_Overrun_Error" |
    "Tag_Memory_Locked_Error" |
    "Insufficient_Power" |
    "Nonspecific_Tag_Error" |
    "No_Response_From_Tag" |
    "Nonspecific_Reader_Error";

type LLRP_E_C1G2BlockWriteResultType =
    "Success" |
    "Tag_Memory_Overrun_Error" |
    "Tag_Memory_Locked_Error" |
    "Insufficient_Power" |
    "Nonspecific_Tag_Error" |
    "No_Response_From_Tag" |
    "Nonspecific_Reader_Error";

// Parameters

type LLRP_D_UTCTimestamp = {
    Microseconds: string;

}

type LLRP_D_Uptime = {
    Microseconds: bigint;

}

type LLRP_D_Custom = {
    VendorIdentifier: number;
    ParameterSubtype: number;
    Data: string;

}

type LLRP_D_GeneralDeviceCapabilities = {
    MaxNumberOfAntennaSupported: number;
    CanSetAntennaProperties: BOOL;
    HasUTCClockCapability: BOOL;
    DeviceManufacturerName: number;
    ModelName: number;
    ReaderFirmwareVersion: string;

}
    &
    ParamAtLeastOnce<{
        ReceiveSensitivityTableEntry: LLRP_D_ReceiveSensitivityTableEntry;
    }>
    &
    ParamMultipleOptional<{
        PerAntennaReceiveSensitivityRange: LLRP_D_PerAntennaReceiveSensitivityRange;
    }>
    &
{
    GPIOCapabilities: LLRP_D_GPIOCapabilities;
}
    &
    ParamAtLeastOnce<{
        PerAntennaAirProtocol: LLRP_D_PerAntennaAirProtocol;
    }>

type LLRP_D_ReceiveSensitivityTableEntry = {
    Index: number;
    ReceiveSensitivityValue: number;

}

type LLRP_D_PerAntennaReceiveSensitivityRange = {
    AntennaID: number;
    ReceiveSensitivityIndexMin: number;
    ReceiveSensitivityIndexMax: number;

}

type LLRP_D_PerAntennaAirProtocol = {
    AntennaID: number;
    ProtocolID: LLRP_E_AirProtocols[];

}

type LLRP_D_GPIOCapabilities = {
    NumGPIs: number;
    NumGPOs: number;

}

type LLRP_D_LLRPCapabilities = {
    CanDoRFSurvey: BOOL;
    CanReportBufferFillWarning: BOOL;
    SupportsClientRequestOpSpec: BOOL;
    CanDoTagInventoryStateAwareSingulation: BOOL;
    SupportsEventAndReportHolding: BOOL;
    MaxNumPriorityLevelsSupported: number;
    ClientRequestOpSpecTimeout: number;
    MaxNumROSpecs: number;
    MaxNumSpecsPerROSpec: number;
    MaxNumInventoryParameterSpecsPerAISpec: number;
    MaxNumAccessSpecs: number;
    MaxNumOpSpecsPerAccessSpec: number;

}

type LLRP_D_RegulatoryCapabilities = {
    CountryCode: number;
    CommunicationsStandard: LLRP_E_CommunicationsStandard;

}
    &
{
    UHFBandCapabilities?: LLRP_D_UHFBandCapabilities
}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_UHFBandCapabilities = {

}
    &
    ParamAtLeastOnce<{
        TransmitPowerLevelTableEntry: LLRP_D_TransmitPowerLevelTableEntry;
    }>
    &
{
    FrequencyInformation: LLRP_D_FrequencyInformation;
}
    &
    ChoiceAtLeastOnce<{
        C1G2UHFRFModeTable: LLRP_D_C1G2UHFRFModeTable;

    }>

type LLRP_D_TransmitPowerLevelTableEntry = {
    Index: number;
    TransmitPowerValue: number;

}

type LLRP_D_FrequencyInformation = {
    Hopping: BOOL;

}
    &
    ParamMultipleOptional<{
        FrequencyHopTable: LLRP_D_FrequencyHopTable;
    }>
    &
{
    FixedFrequencyTable?: LLRP_D_FixedFrequencyTable
}

type LLRP_D_FrequencyHopTable = {
    HopTableID: number;
    Frequency: number[];

}

type LLRP_D_FixedFrequencyTable = {
    Frequency: number[];

}

type LLRP_D_ROSpec = {
    ROSpecID: number;
    Priority: number;
    CurrentState: LLRP_E_ROSpecState;

}
    &
{
    ROBoundarySpec: LLRP_D_ROBoundarySpec;
}
    &
{
    ROReportSpec?: LLRP_D_ROReportSpec
}
    &
    ChoiceAtLeastOnce<{
        AISpec: LLRP_D_AISpec;
        RFSurveySpec: LLRP_D_RFSurveySpec;
        Custom: LLRP_D_Custom;

    }>

type LLRP_D_ROBoundarySpec = {

}
    &
{
    ROSpecStartTrigger: LLRP_D_ROSpecStartTrigger;
}
    &
{
    ROSpecStopTrigger: LLRP_D_ROSpecStopTrigger;
}

type LLRP_D_ROSpecStartTrigger = {
    ROSpecStartTriggerType: LLRP_E_ROSpecStartTriggerType;

}
    &
{
    PeriodicTriggerValue?: LLRP_D_PeriodicTriggerValue
}
    &
{
    GPITriggerValue?: LLRP_D_GPITriggerValue
}

type LLRP_D_PeriodicTriggerValue = {
    Offset: number;
    Period: number;

}
    &
{
    UTCTimestamp?: LLRP_D_UTCTimestamp
}

type LLRP_D_GPITriggerValue = {
    GPIPortNum: number;
    GPIEvent: BOOL;
    Timeout: number;

}

type LLRP_D_ROSpecStopTrigger = {
    ROSpecStopTriggerType: LLRP_E_ROSpecStopTriggerType;
    DurationTriggerValue: number;

}
    &
{
    GPITriggerValue?: LLRP_D_GPITriggerValue
}

type LLRP_D_AISpec = {
    AntennaIDs: number[];

}
    &
{
    AISpecStopTrigger: LLRP_D_AISpecStopTrigger;
}
    &
    ParamAtLeastOnce<{
        InventoryParameterSpec: LLRP_D_InventoryParameterSpec;
    }>
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_AISpecStopTrigger = {
    AISpecStopTriggerType: LLRP_E_AISpecStopTriggerType;
    DurationTrigger: number;

}
    &
{
    GPITriggerValue?: LLRP_D_GPITriggerValue
}
    &
{
    TagObservationTrigger?: LLRP_D_TagObservationTrigger
}

type LLRP_D_TagObservationTrigger = {
    TriggerType: LLRP_E_TagObservationTriggerType;
    NumberOfTags: number;
    NumberOfAttempts: number;
    T: number;
    Timeout: number;

}

type LLRP_D_InventoryParameterSpec = {
    InventoryParameterSpecID: number;
    ProtocolID: LLRP_E_AirProtocols;

}
    &
    ParamMultipleOptional<{
        AntennaConfiguration: LLRP_D_AntennaConfiguration;
    }>
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_RFSurveySpec = {
    AntennaID: number;
    StartFrequency: number;
    EndFrequency: number;

}
    &
{
    RFSurveySpecStopTrigger: LLRP_D_RFSurveySpecStopTrigger;
}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_RFSurveySpecStopTrigger = {
    StopTriggerType: LLRP_E_RFSurveySpecStopTriggerType;
    DurationPeriod: number;
    N: number;

}

type LLRP_D_AccessSpec = {
    AccessSpecID: number;
    AntennaID: number;
    ProtocolID: LLRP_E_AirProtocols;
    CurrentState: LLRP_E_AccessSpecState;
    ROSpecID: number;

}
    &
{
    AccessSpecStopTrigger: LLRP_D_AccessSpecStopTrigger;
}
    &
{
    AccessCommand: LLRP_D_AccessCommand;
}
    &
{
    AccessReportSpec?: LLRP_D_AccessReportSpec
}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_AccessSpecStopTrigger = {
    AccessSpecStopTrigger: LLRP_E_AccessSpecStopTriggerType;
    OperationCountValue: number;

}

type LLRP_D_AccessCommand = {

}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>
    &
    ChoiceOnlyOnce<{
        C1G2TagSpec: LLRP_D_C1G2TagSpec;

    }>
    &
    ChoiceAtLeastOnce<{
        C1G2Read: LLRP_D_C1G2Read;
        C1G2Write: LLRP_D_C1G2Write;
        C1G2Kill: LLRP_D_C1G2Kill;
        C1G2Lock: LLRP_D_C1G2Lock;
        C1G2BlockErase: LLRP_D_C1G2BlockErase;
        C1G2BlockWrite: LLRP_D_C1G2BlockWrite;
        Custom: LLRP_D_Custom;

    }>

type LLRP_D_LLRPConfigurationStateValue = {
    LLRPConfigurationStateValue: number;

}

type LLRP_D_Identification = {
    IDType: LLRP_E_IdentificationType;
    ReaderID: string;

}

type LLRP_D_GPOWriteData = {
    GPOPortNumber: number;
    GPOData: BOOL;

}

type LLRP_D_KeepaliveSpec = {
    KeepaliveTriggerType: LLRP_E_KeepaliveTriggerType;
    PeriodicTriggerValue: number;

}

type LLRP_D_AntennaProperties = {
    AntennaConnected: BOOL;
    AntennaID: number;
    AntennaGain: number;

}

type LLRP_D_AntennaConfiguration = {
    AntennaID: number;

}
    &
{
    RFReceiver?: LLRP_D_RFReceiver
}
    &
{
    RFTransmitter?: LLRP_D_RFTransmitter
}
    &
    ChoiceMultipleOptional<{
        C1G2InventoryCommand: LLRP_D_C1G2InventoryCommand;

    }>

type LLRP_D_RFReceiver = {
    ReceiverSensitivity: number;

}

type LLRP_D_RFTransmitter = {
    HopTableID: number;
    ChannelIndex: number;
    TransmitPower: number;

}

type LLRP_D_GPIPortCurrentState = {
    GPIPortNum: number;
    Config: BOOL;
    State: LLRP_E_GPIPortState;

}

type LLRP_D_EventsAndReports = {
    HoldEventsAndReportsUponReconnect: BOOL;

}

type LLRP_D_ROReportSpec = {
    ROReportTrigger: LLRP_E_ROReportTriggerType;
    N: number;

}
    &
{
    TagReportContentSelector: LLRP_D_TagReportContentSelector;
}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_TagReportContentSelector = {
    EnableROSpecID: BOOL;
    EnableSpecIndex: BOOL;
    EnableInventoryParameterSpecID: BOOL;
    EnableAntennaID: BOOL;
    EnableChannelIndex: BOOL;
    EnablePeakRSSI: BOOL;
    EnableFirstSeenTimestamp: BOOL;
    EnableLastSeenTimestamp: BOOL;
    EnableTagSeenCount: BOOL;
    EnableAccessSpecID: BOOL;

}
    &
    ChoiceMultipleOptional<{
        C1G2EPCMemorySelector: LLRP_D_C1G2EPCMemorySelector;

    }>

type LLRP_D_AccessReportSpec = {
    AccessReportTrigger: LLRP_E_AccessReportTriggerType;

}

type LLRP_D_TagReportData = {

}
    &
{
    ROSpecID?: LLRP_D_ROSpecID
}
    &
{
    SpecIndex?: LLRP_D_SpecIndex
}
    &
{
    InventoryParameterSpecID?: LLRP_D_InventoryParameterSpecID
}
    &
{
    AntennaID?: LLRP_D_AntennaID
}
    &
{
    PeakRSSI?: LLRP_D_PeakRSSI
}
    &
{
    ChannelIndex?: LLRP_D_ChannelIndex
}
    &
{
    FirstSeenTimestampUTC?: LLRP_D_FirstSeenTimestampUTC
}
    &
{
    FirstSeenTimestampUptime?: LLRP_D_FirstSeenTimestampUptime
}
    &
{
    LastSeenTimestampUTC?: LLRP_D_LastSeenTimestampUTC
}
    &
{
    LastSeenTimestampUptime?: LLRP_D_LastSeenTimestampUptime
}
    &
{
    TagSeenCount?: LLRP_D_TagSeenCount
}
    &
{
    AccessSpecID?: LLRP_D_AccessSpecID
}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>
    &
    ChoiceOnlyOnce<{
        EPCData: LLRP_D_EPCData;
        EPC_96: LLRP_D_EPC_96;

    }>
    &
    ChoiceMultipleOptional<{
        C1G2_PC: LLRP_D_C1G2_PC;
        C1G2_CRC: LLRP_D_C1G2_CRC;

    }>
    &
    ChoiceMultipleOptional<{
        C1G2ReadOpSpecResult: LLRP_D_C1G2ReadOpSpecResult;
        C1G2WriteOpSpecResult: LLRP_D_C1G2WriteOpSpecResult;
        C1G2KillOpSpecResult: LLRP_D_C1G2KillOpSpecResult;
        C1G2LockOpSpecResult: LLRP_D_C1G2LockOpSpecResult;
        C1G2BlockEraseOpSpecResult: LLRP_D_C1G2BlockEraseOpSpecResult;
        C1G2BlockWriteOpSpecResult: LLRP_D_C1G2BlockWriteOpSpecResult;
        Custom: LLRP_D_Custom;

    }>

type LLRP_D_EPCData = {
    EPC: string;

}

type LLRP_D_EPC_96 = {
    EPC: string;

}

type LLRP_D_ROSpecID = {
    ROSpecID: number;

}

type LLRP_D_SpecIndex = {
    SpecIndex: number;

}

type LLRP_D_InventoryParameterSpecID = {
    InventoryParameterSpecID: number;

}

type LLRP_D_AntennaID = {
    AntennaID: number;

}

type LLRP_D_PeakRSSI = {
    PeakRSSI: number;

}

type LLRP_D_ChannelIndex = {
    ChannelIndex: number;

}

type LLRP_D_FirstSeenTimestampUTC = {
    Microseconds: string;

}

type LLRP_D_FirstSeenTimestampUptime = {
    Microseconds: bigint;

}

type LLRP_D_LastSeenTimestampUTC = {
    Microseconds: string;

}

type LLRP_D_LastSeenTimestampUptime = {
    Microseconds: bigint;

}

type LLRP_D_TagSeenCount = {
    TagCount: number;

}

type LLRP_D_AccessSpecID = {
    AccessSpecID: number;

}

type LLRP_D_RFSurveyReportData = {

}
    &
{
    ROSpecID?: LLRP_D_ROSpecID
}
    &
{
    SpecIndex?: LLRP_D_SpecIndex
}
    &
    ParamAtLeastOnce<{
        FrequencyRSSILevelEntry: LLRP_D_FrequencyRSSILevelEntry;
    }>
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_FrequencyRSSILevelEntry = {
    Frequency: number;
    Bandwidth: number;
    AverageRSSI: number;
    PeakRSSI: number;

}
    &
    ChoiceOnlyOnce<{
        UTCTimestamp: LLRP_D_UTCTimestamp;
        Uptime: LLRP_D_Uptime;

    }>

type LLRP_D_ReaderEventNotificationSpec = {

}
    &
    ParamAtLeastOnce<{
        EventNotificationState: LLRP_D_EventNotificationState;
    }>

type LLRP_D_EventNotificationState = {
    EventType: LLRP_E_NotificationEventType;
    NotificationState: BOOL;

}

type LLRP_D_ReaderEventNotificationData = {

}
    &
{
    HoppingEvent?: LLRP_D_HoppingEvent
}
    &
{
    GPIEvent?: LLRP_D_GPIEvent
}
    &
{
    ROSpecEvent?: LLRP_D_ROSpecEvent
}
    &
{
    ReportBufferLevelWarningEvent?: LLRP_D_ReportBufferLevelWarningEvent
}
    &
{
    ReportBufferOverflowErrorEvent?: LLRP_D_ReportBufferOverflowErrorEvent
}
    &
{
    ReaderExceptionEvent?: LLRP_D_ReaderExceptionEvent
}
    &
{
    RFSurveyEvent?: LLRP_D_RFSurveyEvent
}
    &
{
    AISpecEvent?: LLRP_D_AISpecEvent
}
    &
{
    AntennaEvent?: LLRP_D_AntennaEvent
}
    &
{
    ConnectionAttemptEvent?: LLRP_D_ConnectionAttemptEvent
}
    &
{
    ConnectionCloseEvent?: LLRP_D_ConnectionCloseEvent
}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>
    &
    ChoiceOnlyOnce<{
        UTCTimestamp: LLRP_D_UTCTimestamp;
        Uptime: LLRP_D_Uptime;

    }>

type LLRP_D_HoppingEvent = {
    HopTableID: number;
    NextChannelIndex: number;

}

type LLRP_D_GPIEvent = {
    GPIPortNumber: number;
    GPIEvent: BOOL;

}

type LLRP_D_ROSpecEvent = {
    EventType: LLRP_E_ROSpecEventType;
    ROSpecID: number;
    PreemptingROSpecID: number;

}

type LLRP_D_ReportBufferLevelWarningEvent = {
    ReportBufferPercentageFull: number;

}

type LLRP_D_ReportBufferOverflowErrorEvent = {

}

type LLRP_D_ReaderExceptionEvent = {
    Message: string;

}
    &
{
    ROSpecID?: LLRP_D_ROSpecID
}
    &
{
    SpecIndex?: LLRP_D_SpecIndex
}
    &
{
    InventoryParameterSpecID?: LLRP_D_InventoryParameterSpecID
}
    &
{
    AntennaID?: LLRP_D_AntennaID
}
    &
{
    AccessSpecID?: LLRP_D_AccessSpecID
}
    &
{
    OpSpecID?: LLRP_D_OpSpecID
}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_OpSpecID = {
    OpSpecID: number;

}

type LLRP_D_RFSurveyEvent = {
    EventType: LLRP_E_RFSurveyEventType;
    ROSpecID: number;
    SpecIndex: number;

}

type LLRP_D_AISpecEvent = {
    EventType: LLRP_E_AISpecEventType;
    ROSpecID: number;
    SpecIndex: number;

}
    &
    ChoiceOnceAtMost<{
        C1G2SingulationDetails: LLRP_D_C1G2SingulationDetails;

    }>

type LLRP_D_AntennaEvent = {
    EventType: LLRP_E_AntennaEventType;
    AntennaID: number;

}

type LLRP_D_ConnectionAttemptEvent = {
    Status: LLRP_E_ConnectionAttemptStatusType;

}

type LLRP_D_ConnectionCloseEvent = {

}

type LLRP_D_LLRPStatus = {
    StatusCode: LLRP_E_StatusCode;
    ErrorDescription: string;

}
    &
{
    FieldError?: LLRP_D_FieldError
}
    &
{
    ParameterError?: LLRP_D_ParameterError
}

type LLRP_D_FieldError = {
    FieldNum: number;
    ErrorCode: LLRP_E_StatusCode;

}

type LLRP_D_ParameterError = {
    ParameterType: number;
    ErrorCode: LLRP_E_StatusCode;

}
    &
{
    FieldError?: LLRP_D_FieldError
}
    &
{
    ParameterError?: LLRP_D_ParameterError
}

type LLRP_D_C1G2LLRPCapabilities = {
    CanSupportBlockErase: BOOL;
    CanSupportBlockWrite: BOOL;
    MaxNumSelectFiltersPerQuery: number;

}

type LLRP_D_C1G2UHFRFModeTable = {

}
    &
    ParamAtLeastOnce<{
        C1G2UHFRFModeTableEntry: LLRP_D_C1G2UHFRFModeTableEntry;
    }>

type LLRP_D_C1G2UHFRFModeTableEntry = {
    ModeIdentifier: number;
    DRValue: LLRP_E_C1G2DRValue;
    EPCHAGTCConformance: BOOL;
    MValue: LLRP_E_C1G2MValue;
    ForwardLinkModulation: LLRP_E_C1G2ForwardLinkModulation;
    SpectralMaskIndicator: LLRP_E_C1G2SpectralMaskIndicator;
    BDRValue: number;
    PIEValue: number;
    MinTariValue: number;
    MaxTariValue: number;
    StepTariValue: number;

}

type LLRP_D_C1G2InventoryCommand = {
    TagInventoryStateAware: BOOL;

}
    &
    ParamMultipleOptional<{
        C1G2Filter: LLRP_D_C1G2Filter;
    }>
    &
{
    C1G2RFControl?: LLRP_D_C1G2RFControl
}
    &
{
    C1G2SingulationControl?: LLRP_D_C1G2SingulationControl
}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_C1G2Filter = {
    T: LLRP_E_C1G2TruncateAction;

}
    &
{
    C1G2TagInventoryMask: LLRP_D_C1G2TagInventoryMask;
}
    &
{
    C1G2TagInventoryStateAwareFilterAction?: LLRP_D_C1G2TagInventoryStateAwareFilterAction
}
    &
{
    C1G2TagInventoryStateUnawareFilterAction?: LLRP_D_C1G2TagInventoryStateUnawareFilterAction
}

type LLRP_D_C1G2TagInventoryMask = {
    MB: CRUMB;
    Pointer: number;
    TagMask: string;

}

type LLRP_D_C1G2TagInventoryStateAwareFilterAction = {
    Target: LLRP_E_C1G2StateAwareTarget;
    Action: LLRP_E_C1G2StateAwareAction;

}

type LLRP_D_C1G2TagInventoryStateUnawareFilterAction = {
    Action: LLRP_E_C1G2StateUnawareAction;

}

type LLRP_D_C1G2RFControl = {
    ModeIndex: number;
    Tari: number;

}

type LLRP_D_C1G2SingulationControl = {
    Session: CRUMB;
    TagPopulation: number;
    TagTransitTime: number;

}
    &
{
    C1G2TagInventoryStateAwareSingulationAction?: LLRP_D_C1G2TagInventoryStateAwareSingulationAction
}

type LLRP_D_C1G2TagInventoryStateAwareSingulationAction = {
    I: LLRP_E_C1G2TagInventoryStateAwareI;
    S: LLRP_E_C1G2TagInventoryStateAwareS;

}

type LLRP_D_C1G2TagSpec = {

}
    &
    ParamAtLeastOnce<{
        C1G2TargetTag: LLRP_D_C1G2TargetTag;
    }>

type LLRP_D_C1G2TargetTag = {
    MB: CRUMB;
    Match: BOOL;
    Pointer: number;
    TagMask: string;
    TagData: string;

}

type LLRP_D_C1G2Read = {
    OpSpecID: number;
    AccessPassword: number;
    MB: CRUMB;
    WordPointer: number;
    WordCount: number;

}

type LLRP_D_C1G2Write = {
    OpSpecID: number;
    AccessPassword: number;
    MB: CRUMB;
    WordPointer: number;
    WriteData: string;

}

type LLRP_D_C1G2Kill = {
    OpSpecID: number;
    KillPassword: number;

}

type LLRP_D_C1G2Lock = {
    OpSpecID: number;
    AccessPassword: number;

}
    &
    ParamAtLeastOnce<{
        C1G2LockPayload: LLRP_D_C1G2LockPayload;
    }>

type LLRP_D_C1G2LockPayload = {
    Privilege: LLRP_E_C1G2LockPrivilege;
    DataField: LLRP_E_C1G2LockDataField;

}

type LLRP_D_C1G2BlockErase = {
    OpSpecID: number;
    AccessPassword: number;
    MB: CRUMB;
    WordPointer: number;
    WordCount: number;

}

type LLRP_D_C1G2BlockWrite = {
    OpSpecID: number;
    AccessPassword: number;
    MB: CRUMB;
    WordPointer: number;
    WriteData: string;

}

type LLRP_D_C1G2EPCMemorySelector = {
    EnableCRC: BOOL;
    EnablePCBits: BOOL;

}

type LLRP_D_C1G2_PC = {
    PC_Bits: number;

}

type LLRP_D_C1G2_CRC = {
    CRC: number;

}

type LLRP_D_C1G2SingulationDetails = {
    NumCollisionSlots: number;
    NumEmptySlots: number;

}

type LLRP_D_C1G2ReadOpSpecResult = {
    Result: LLRP_E_C1G2ReadResultType;
    OpSpecID: number;
    ReadData: string;

}

type LLRP_D_C1G2WriteOpSpecResult = {
    Result: LLRP_E_C1G2WriteResultType;
    OpSpecID: number;
    NumWordsWritten: number;

}

type LLRP_D_C1G2KillOpSpecResult = {
    Result: LLRP_E_C1G2KillResultType;
    OpSpecID: number;

}

type LLRP_D_C1G2LockOpSpecResult = {
    Result: LLRP_E_C1G2LockResultType;
    OpSpecID: number;

}

type LLRP_D_C1G2BlockEraseOpSpecResult = {
    Result: LLRP_E_C1G2BlockEraseResultType;
    OpSpecID: number;

}

type LLRP_D_C1G2BlockWriteOpSpecResult = {
    Result: LLRP_E_C1G2BlockWriteResultType;
    OpSpecID: number;
    NumWordsWritten: number;

}

// Choices

// Messages

type LLRP_D_CUSTOM_MESSAGE = {
    VendorIdentifier: number;
    MessageSubtype: number;
    Data: string;

}

type LLRP_D_GET_READER_CAPABILITIES = {
    RequestedData: LLRP_E_GetReaderCapabilitiesRequestedData;

}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_GET_READER_CAPABILITIES_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}
    &
{
    GeneralDeviceCapabilities?: LLRP_D_GeneralDeviceCapabilities
}
    &
{
    LLRPCapabilities?: LLRP_D_LLRPCapabilities
}
    &
{
    RegulatoryCapabilities?: LLRP_D_RegulatoryCapabilities
}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>
    &
    ChoiceOnceAtMost<{
        C1G2LLRPCapabilities: LLRP_D_C1G2LLRPCapabilities;

    }>

type LLRP_D_ADD_ROSPEC = {

}
    &
{
    ROSpec: LLRP_D_ROSpec;
}

type LLRP_D_ADD_ROSPEC_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_DELETE_ROSPEC = {
    ROSpecID: number;

}

type LLRP_D_DELETE_ROSPEC_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_START_ROSPEC = {
    ROSpecID: number;

}

type LLRP_D_START_ROSPEC_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_STOP_ROSPEC = {
    ROSpecID: number;

}

type LLRP_D_STOP_ROSPEC_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_ENABLE_ROSPEC = {
    ROSpecID: number;

}

type LLRP_D_ENABLE_ROSPEC_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_DISABLE_ROSPEC = {
    ROSpecID: number;

}

type LLRP_D_DISABLE_ROSPEC_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_GET_ROSPECS = {

}

type LLRP_D_GET_ROSPECS_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}
    &
    ParamMultipleOptional<{
        ROSpec: LLRP_D_ROSpec;
    }>

type LLRP_D_ADD_ACCESSSPEC = {

}
    &
{
    AccessSpec: LLRP_D_AccessSpec;
}

type LLRP_D_ADD_ACCESSSPEC_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_DELETE_ACCESSSPEC = {
    AccessSpecID: number;

}

type LLRP_D_DELETE_ACCESSSPEC_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_ENABLE_ACCESSSPEC = {
    AccessSpecID: number;

}

type LLRP_D_ENABLE_ACCESSSPEC_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_DISABLE_ACCESSSPEC = {
    AccessSpecID: number;

}

type LLRP_D_DISABLE_ACCESSSPEC_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_GET_ACCESSSPECS = {

}

type LLRP_D_GET_ACCESSSPECS_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}
    &
    ParamMultipleOptional<{
        AccessSpec: LLRP_D_AccessSpec;
    }>

type LLRP_D_GET_READER_CONFIG = {
    AntennaID: number;
    RequestedData: LLRP_E_GetReaderConfigRequestedData;
    GPIPortNum: number;
    GPOPortNum: number;

}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_GET_READER_CONFIG_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}
    &
{
    Identification?: LLRP_D_Identification
}
    &
    ParamMultipleOptional<{
        AntennaProperties: LLRP_D_AntennaProperties;
    }>
    &
    ParamMultipleOptional<{
        AntennaConfiguration: LLRP_D_AntennaConfiguration;
    }>
    &
{
    ReaderEventNotificationSpec?: LLRP_D_ReaderEventNotificationSpec
}
    &
{
    ROReportSpec?: LLRP_D_ROReportSpec
}
    &
{
    AccessReportSpec?: LLRP_D_AccessReportSpec
}
    &
{
    LLRPConfigurationStateValue?: LLRP_D_LLRPConfigurationStateValue
}
    &
{
    KeepaliveSpec?: LLRP_D_KeepaliveSpec
}
    &
    ParamMultipleOptional<{
        GPIPortCurrentState: LLRP_D_GPIPortCurrentState;
    }>
    &
    ParamMultipleOptional<{
        GPOWriteData: LLRP_D_GPOWriteData;
    }>
    &
{
    EventsAndReports?: LLRP_D_EventsAndReports
}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_SET_READER_CONFIG = {
    ResetToFactoryDefault: BOOL;

}
    &
{
    ReaderEventNotificationSpec?: LLRP_D_ReaderEventNotificationSpec
}
    &
    ParamMultipleOptional<{
        AntennaProperties: LLRP_D_AntennaProperties;
    }>
    &
    ParamMultipleOptional<{
        AntennaConfiguration: LLRP_D_AntennaConfiguration;
    }>
    &
{
    ROReportSpec?: LLRP_D_ROReportSpec
}
    &
{
    AccessReportSpec?: LLRP_D_AccessReportSpec
}
    &
{
    KeepaliveSpec?: LLRP_D_KeepaliveSpec
}
    &
    ParamMultipleOptional<{
        GPOWriteData: LLRP_D_GPOWriteData;
    }>
    &
    ParamMultipleOptional<{
        GPIPortCurrentState: LLRP_D_GPIPortCurrentState;
    }>
    &
{
    EventsAndReports?: LLRP_D_EventsAndReports
}
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_SET_READER_CONFIG_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_CLOSE_CONNECTION = {

}

type LLRP_D_CLOSE_CONNECTION_RESPONSE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_GET_REPORT = {

}

type LLRP_D_RO_ACCESS_REPORT = {

}
    &
    ParamMultipleOptional<{
        TagReportData: LLRP_D_TagReportData;
    }>
    &
    ParamMultipleOptional<{
        RFSurveyReportData: LLRP_D_RFSurveyReportData;
    }>
    &
    ParamMultipleOptional<{
        Custom: LLRP_D_Custom;
    }>

type LLRP_D_KEEPALIVE = {

}

type LLRP_D_KEEPALIVE_ACK = {

}

type LLRP_D_READER_EVENT_NOTIFICATION = {

}
    &
{
    ReaderEventNotificationData: LLRP_D_ReaderEventNotificationData;
}

type LLRP_D_ENABLE_EVENTS_AND_REPORTS = {

}

type LLRP_D_ERROR_MESSAGE = {

}
    &
{
    LLRPStatus: LLRP_D_LLRPStatus;
}

// CUSTOM_MESSAGE
export class LLRP_C_CUSTOM_MESSAGE extends LLRPMessage<LLRP_D_CUSTOM_MESSAGE> {
    constructor(args?: GetCtrArgs<LLRP_C_CUSTOM_MESSAGE>) {
        super({ ...args, ...{ type: "CUSTOM_MESSAGE" } });
    }

    // Fields


    // VendorIdentifier
    setVendorIdentifier(v: number) {
        return this.origin.setField("VendorIdentifier", v);
    }

    getVendorIdentifier() {
        return this.origin.getField("VendorIdentifier") as number;
    }

    // MessageSubtype
    setMessageSubtype(v: number) {
        return this.origin.setField("MessageSubtype", v);
    }

    getMessageSubtype() {
        return this.origin.getField("MessageSubtype") as number;
    }

    // Data
    setData(v: string) {
        return this.origin.setField("Data", v);
    }

    getData() {
        return this.origin.getField("Data") as string;
    }


    // Sub-elements



    // Choices


}

// GET_READER_CAPABILITIES
export class LLRP_C_GET_READER_CAPABILITIES extends LLRPMessage<LLRP_D_GET_READER_CAPABILITIES> {
    constructor(args?: GetCtrArgs<LLRP_C_GET_READER_CAPABILITIES>) {
        super({ ...args, ...{ type: "GET_READER_CAPABILITIES" } });
    }

    // Fields


    // RequestedData
    setRequestedData(v: LLRP_E_GetReaderCapabilitiesRequestedData) {
        return this.origin.setField("RequestedData", v);
    }

    getRequestedData() {
        return this.origin.getField("RequestedData") as LLRP_E_GetReaderCapabilitiesRequestedData;
    }


    // Sub-elements


    // Custom
    addCustom(v: LLRP_D_Custom) {
        return this.origin.addSubElement("Custom", v);
    }

    getCustom(): LLRP_D_Custom[] {
        return this.origin.getSubElement("Custom");
    }


    // Choices


}

// GET_READER_CAPABILITIES_RESPONSE
export class LLRP_C_GET_READER_CAPABILITIES_RESPONSE extends LLRPMessage<LLRP_D_GET_READER_CAPABILITIES_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_GET_READER_CAPABILITIES_RESPONSE>) {
        super({ ...args, ...{ type: "GET_READER_CAPABILITIES_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }

    // GeneralDeviceCapabilities
    setGeneralDeviceCapabilities(v: LLRP_D_GeneralDeviceCapabilities) {
        return this.origin.setSubElement("GeneralDeviceCapabilities", v);
    }

    getGeneralDeviceCapabilities(): LLRP_D_GeneralDeviceCapabilities {
        return this.origin.getSubElement("GeneralDeviceCapabilities");
    }

    // LLRPCapabilities
    setLLRPCapabilities(v: LLRP_D_LLRPCapabilities) {
        return this.origin.setSubElement("LLRPCapabilities", v);
    }

    getLLRPCapabilities(): LLRP_D_LLRPCapabilities {
        return this.origin.getSubElement("LLRPCapabilities");
    }

    // RegulatoryCapabilities
    setRegulatoryCapabilities(v: LLRP_D_RegulatoryCapabilities) {
        return this.origin.setSubElement("RegulatoryCapabilities", v);
    }

    getRegulatoryCapabilities(): LLRP_D_RegulatoryCapabilities {
        return this.origin.getSubElement("RegulatoryCapabilities");
    }

    // Custom
    addCustom(v: LLRP_D_Custom) {
        return this.origin.addSubElement("Custom", v);
    }

    getCustom(): LLRP_D_Custom[] {
        return this.origin.getSubElement("Custom");
    }


    // Choices


    // C1G2LLRPCapabilities
    setC1G2LLRPCapabilities(v: LLRP_D_C1G2LLRPCapabilities) {
        return this.origin.setSubElement("C1G2LLRPCapabilities", v);
    }

    getC1G2LLRPCapabilities(): LLRP_D_C1G2LLRPCapabilities {
        return this.origin.getSubElement("C1G2LLRPCapabilities");
    }

}

// ADD_ROSPEC
export class LLRP_C_ADD_ROSPEC extends LLRPMessage<LLRP_D_ADD_ROSPEC> {
    constructor(args?: GetCtrArgs<LLRP_C_ADD_ROSPEC>) {
        super({ ...args, ...{ type: "ADD_ROSPEC" } });
    }

    // Fields



    // Sub-elements


    // ROSpec
    setROSpec(v: LLRP_D_ROSpec) {
        return this.origin.setSubElement("ROSpec", v);
    }

    getROSpec(): LLRP_D_ROSpec {
        return this.origin.getSubElement("ROSpec");
    }


    // Choices


}

// ADD_ROSPEC_RESPONSE
export class LLRP_C_ADD_ROSPEC_RESPONSE extends LLRPMessage<LLRP_D_ADD_ROSPEC_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_ADD_ROSPEC_RESPONSE>) {
        super({ ...args, ...{ type: "ADD_ROSPEC_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// DELETE_ROSPEC
export class LLRP_C_DELETE_ROSPEC extends LLRPMessage<LLRP_D_DELETE_ROSPEC> {
    constructor(args?: GetCtrArgs<LLRP_C_DELETE_ROSPEC>) {
        super({ ...args, ...{ type: "DELETE_ROSPEC" } });
    }

    // Fields


    // ROSpecID
    setROSpecID(v: number) {
        return this.origin.setField("ROSpecID", v);
    }

    getROSpecID() {
        return this.origin.getField("ROSpecID") as number;
    }


    // Sub-elements



    // Choices


}

// DELETE_ROSPEC_RESPONSE
export class LLRP_C_DELETE_ROSPEC_RESPONSE extends LLRPMessage<LLRP_D_DELETE_ROSPEC_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_DELETE_ROSPEC_RESPONSE>) {
        super({ ...args, ...{ type: "DELETE_ROSPEC_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// START_ROSPEC
export class LLRP_C_START_ROSPEC extends LLRPMessage<LLRP_D_START_ROSPEC> {
    constructor(args?: GetCtrArgs<LLRP_C_START_ROSPEC>) {
        super({ ...args, ...{ type: "START_ROSPEC" } });
    }

    // Fields


    // ROSpecID
    setROSpecID(v: number) {
        return this.origin.setField("ROSpecID", v);
    }

    getROSpecID() {
        return this.origin.getField("ROSpecID") as number;
    }


    // Sub-elements



    // Choices


}

// START_ROSPEC_RESPONSE
export class LLRP_C_START_ROSPEC_RESPONSE extends LLRPMessage<LLRP_D_START_ROSPEC_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_START_ROSPEC_RESPONSE>) {
        super({ ...args, ...{ type: "START_ROSPEC_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// STOP_ROSPEC
export class LLRP_C_STOP_ROSPEC extends LLRPMessage<LLRP_D_STOP_ROSPEC> {
    constructor(args?: GetCtrArgs<LLRP_C_STOP_ROSPEC>) {
        super({ ...args, ...{ type: "STOP_ROSPEC" } });
    }

    // Fields


    // ROSpecID
    setROSpecID(v: number) {
        return this.origin.setField("ROSpecID", v);
    }

    getROSpecID() {
        return this.origin.getField("ROSpecID") as number;
    }


    // Sub-elements



    // Choices


}

// STOP_ROSPEC_RESPONSE
export class LLRP_C_STOP_ROSPEC_RESPONSE extends LLRPMessage<LLRP_D_STOP_ROSPEC_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_STOP_ROSPEC_RESPONSE>) {
        super({ ...args, ...{ type: "STOP_ROSPEC_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// ENABLE_ROSPEC
export class LLRP_C_ENABLE_ROSPEC extends LLRPMessage<LLRP_D_ENABLE_ROSPEC> {
    constructor(args?: GetCtrArgs<LLRP_C_ENABLE_ROSPEC>) {
        super({ ...args, ...{ type: "ENABLE_ROSPEC" } });
    }

    // Fields


    // ROSpecID
    setROSpecID(v: number) {
        return this.origin.setField("ROSpecID", v);
    }

    getROSpecID() {
        return this.origin.getField("ROSpecID") as number;
    }


    // Sub-elements



    // Choices


}

// ENABLE_ROSPEC_RESPONSE
export class LLRP_C_ENABLE_ROSPEC_RESPONSE extends LLRPMessage<LLRP_D_ENABLE_ROSPEC_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_ENABLE_ROSPEC_RESPONSE>) {
        super({ ...args, ...{ type: "ENABLE_ROSPEC_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// DISABLE_ROSPEC
export class LLRP_C_DISABLE_ROSPEC extends LLRPMessage<LLRP_D_DISABLE_ROSPEC> {
    constructor(args?: GetCtrArgs<LLRP_C_DISABLE_ROSPEC>) {
        super({ ...args, ...{ type: "DISABLE_ROSPEC" } });
    }

    // Fields


    // ROSpecID
    setROSpecID(v: number) {
        return this.origin.setField("ROSpecID", v);
    }

    getROSpecID() {
        return this.origin.getField("ROSpecID") as number;
    }


    // Sub-elements



    // Choices


}

// DISABLE_ROSPEC_RESPONSE
export class LLRP_C_DISABLE_ROSPEC_RESPONSE extends LLRPMessage<LLRP_D_DISABLE_ROSPEC_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_DISABLE_ROSPEC_RESPONSE>) {
        super({ ...args, ...{ type: "DISABLE_ROSPEC_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// GET_ROSPECS
export class LLRP_C_GET_ROSPECS extends LLRPMessage<LLRP_D_GET_ROSPECS> {
    constructor(args?: GetCtrArgs<LLRP_C_GET_ROSPECS>) {
        super({ ...args, ...{ type: "GET_ROSPECS" } });
    }

    // Fields



    // Sub-elements



    // Choices


}

// GET_ROSPECS_RESPONSE
export class LLRP_C_GET_ROSPECS_RESPONSE extends LLRPMessage<LLRP_D_GET_ROSPECS_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_GET_ROSPECS_RESPONSE>) {
        super({ ...args, ...{ type: "GET_ROSPECS_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }

    // ROSpec
    addROSpec(v: LLRP_D_ROSpec) {
        return this.origin.addSubElement("ROSpec", v);
    }

    getROSpec(): LLRP_D_ROSpec[] {
        return this.origin.getSubElement("ROSpec");
    }


    // Choices


}

// ADD_ACCESSSPEC
export class LLRP_C_ADD_ACCESSSPEC extends LLRPMessage<LLRP_D_ADD_ACCESSSPEC> {
    constructor(args?: GetCtrArgs<LLRP_C_ADD_ACCESSSPEC>) {
        super({ ...args, ...{ type: "ADD_ACCESSSPEC" } });
    }

    // Fields



    // Sub-elements


    // AccessSpec
    setAccessSpec(v: LLRP_D_AccessSpec) {
        return this.origin.setSubElement("AccessSpec", v);
    }

    getAccessSpec(): LLRP_D_AccessSpec {
        return this.origin.getSubElement("AccessSpec");
    }


    // Choices


}

// ADD_ACCESSSPEC_RESPONSE
export class LLRP_C_ADD_ACCESSSPEC_RESPONSE extends LLRPMessage<LLRP_D_ADD_ACCESSSPEC_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_ADD_ACCESSSPEC_RESPONSE>) {
        super({ ...args, ...{ type: "ADD_ACCESSSPEC_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// DELETE_ACCESSSPEC
export class LLRP_C_DELETE_ACCESSSPEC extends LLRPMessage<LLRP_D_DELETE_ACCESSSPEC> {
    constructor(args?: GetCtrArgs<LLRP_C_DELETE_ACCESSSPEC>) {
        super({ ...args, ...{ type: "DELETE_ACCESSSPEC" } });
    }

    // Fields


    // AccessSpecID
    setAccessSpecID(v: number) {
        return this.origin.setField("AccessSpecID", v);
    }

    getAccessSpecID() {
        return this.origin.getField("AccessSpecID") as number;
    }


    // Sub-elements



    // Choices


}

// DELETE_ACCESSSPEC_RESPONSE
export class LLRP_C_DELETE_ACCESSSPEC_RESPONSE extends LLRPMessage<LLRP_D_DELETE_ACCESSSPEC_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_DELETE_ACCESSSPEC_RESPONSE>) {
        super({ ...args, ...{ type: "DELETE_ACCESSSPEC_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// ENABLE_ACCESSSPEC
export class LLRP_C_ENABLE_ACCESSSPEC extends LLRPMessage<LLRP_D_ENABLE_ACCESSSPEC> {
    constructor(args?: GetCtrArgs<LLRP_C_ENABLE_ACCESSSPEC>) {
        super({ ...args, ...{ type: "ENABLE_ACCESSSPEC" } });
    }

    // Fields


    // AccessSpecID
    setAccessSpecID(v: number) {
        return this.origin.setField("AccessSpecID", v);
    }

    getAccessSpecID() {
        return this.origin.getField("AccessSpecID") as number;
    }


    // Sub-elements



    // Choices


}

// ENABLE_ACCESSSPEC_RESPONSE
export class LLRP_C_ENABLE_ACCESSSPEC_RESPONSE extends LLRPMessage<LLRP_D_ENABLE_ACCESSSPEC_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_ENABLE_ACCESSSPEC_RESPONSE>) {
        super({ ...args, ...{ type: "ENABLE_ACCESSSPEC_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// DISABLE_ACCESSSPEC
export class LLRP_C_DISABLE_ACCESSSPEC extends LLRPMessage<LLRP_D_DISABLE_ACCESSSPEC> {
    constructor(args?: GetCtrArgs<LLRP_C_DISABLE_ACCESSSPEC>) {
        super({ ...args, ...{ type: "DISABLE_ACCESSSPEC" } });
    }

    // Fields


    // AccessSpecID
    setAccessSpecID(v: number) {
        return this.origin.setField("AccessSpecID", v);
    }

    getAccessSpecID() {
        return this.origin.getField("AccessSpecID") as number;
    }


    // Sub-elements



    // Choices


}

// DISABLE_ACCESSSPEC_RESPONSE
export class LLRP_C_DISABLE_ACCESSSPEC_RESPONSE extends LLRPMessage<LLRP_D_DISABLE_ACCESSSPEC_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_DISABLE_ACCESSSPEC_RESPONSE>) {
        super({ ...args, ...{ type: "DISABLE_ACCESSSPEC_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// GET_ACCESSSPECS
export class LLRP_C_GET_ACCESSSPECS extends LLRPMessage<LLRP_D_GET_ACCESSSPECS> {
    constructor(args?: GetCtrArgs<LLRP_C_GET_ACCESSSPECS>) {
        super({ ...args, ...{ type: "GET_ACCESSSPECS" } });
    }

    // Fields



    // Sub-elements



    // Choices


}

// GET_ACCESSSPECS_RESPONSE
export class LLRP_C_GET_ACCESSSPECS_RESPONSE extends LLRPMessage<LLRP_D_GET_ACCESSSPECS_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_GET_ACCESSSPECS_RESPONSE>) {
        super({ ...args, ...{ type: "GET_ACCESSSPECS_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }

    // AccessSpec
    addAccessSpec(v: LLRP_D_AccessSpec) {
        return this.origin.addSubElement("AccessSpec", v);
    }

    getAccessSpec(): LLRP_D_AccessSpec[] {
        return this.origin.getSubElement("AccessSpec");
    }


    // Choices


}

// GET_READER_CONFIG
export class LLRP_C_GET_READER_CONFIG extends LLRPMessage<LLRP_D_GET_READER_CONFIG> {
    constructor(args?: GetCtrArgs<LLRP_C_GET_READER_CONFIG>) {
        super({ ...args, ...{ type: "GET_READER_CONFIG" } });
    }

    // Fields


    // AntennaID
    setAntennaID(v: number) {
        return this.origin.setField("AntennaID", v);
    }

    getAntennaID() {
        return this.origin.getField("AntennaID") as number;
    }

    // RequestedData
    setRequestedData(v: LLRP_E_GetReaderConfigRequestedData) {
        return this.origin.setField("RequestedData", v);
    }

    getRequestedData() {
        return this.origin.getField("RequestedData") as LLRP_E_GetReaderConfigRequestedData;
    }

    // GPIPortNum
    setGPIPortNum(v: number) {
        return this.origin.setField("GPIPortNum", v);
    }

    getGPIPortNum() {
        return this.origin.getField("GPIPortNum") as number;
    }

    // GPOPortNum
    setGPOPortNum(v: number) {
        return this.origin.setField("GPOPortNum", v);
    }

    getGPOPortNum() {
        return this.origin.getField("GPOPortNum") as number;
    }


    // Sub-elements


    // Custom
    addCustom(v: LLRP_D_Custom) {
        return this.origin.addSubElement("Custom", v);
    }

    getCustom(): LLRP_D_Custom[] {
        return this.origin.getSubElement("Custom");
    }


    // Choices


}

// GET_READER_CONFIG_RESPONSE
export class LLRP_C_GET_READER_CONFIG_RESPONSE extends LLRPMessage<LLRP_D_GET_READER_CONFIG_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_GET_READER_CONFIG_RESPONSE>) {
        super({ ...args, ...{ type: "GET_READER_CONFIG_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }

    // Identification
    setIdentification(v: LLRP_D_Identification) {
        return this.origin.setSubElement("Identification", v);
    }

    getIdentification(): LLRP_D_Identification {
        return this.origin.getSubElement("Identification");
    }

    // AntennaProperties
    addAntennaProperties(v: LLRP_D_AntennaProperties) {
        return this.origin.addSubElement("AntennaProperties", v);
    }

    getAntennaProperties(): LLRP_D_AntennaProperties[] {
        return this.origin.getSubElement("AntennaProperties");
    }

    // AntennaConfiguration
    addAntennaConfiguration(v: LLRP_D_AntennaConfiguration) {
        return this.origin.addSubElement("AntennaConfiguration", v);
    }

    getAntennaConfiguration(): LLRP_D_AntennaConfiguration[] {
        return this.origin.getSubElement("AntennaConfiguration");
    }

    // ReaderEventNotificationSpec
    setReaderEventNotificationSpec(v: LLRP_D_ReaderEventNotificationSpec) {
        return this.origin.setSubElement("ReaderEventNotificationSpec", v);
    }

    getReaderEventNotificationSpec(): LLRP_D_ReaderEventNotificationSpec {
        return this.origin.getSubElement("ReaderEventNotificationSpec");
    }

    // ROReportSpec
    setROReportSpec(v: LLRP_D_ROReportSpec) {
        return this.origin.setSubElement("ROReportSpec", v);
    }

    getROReportSpec(): LLRP_D_ROReportSpec {
        return this.origin.getSubElement("ROReportSpec");
    }

    // AccessReportSpec
    setAccessReportSpec(v: LLRP_D_AccessReportSpec) {
        return this.origin.setSubElement("AccessReportSpec", v);
    }

    getAccessReportSpec(): LLRP_D_AccessReportSpec {
        return this.origin.getSubElement("AccessReportSpec");
    }

    // LLRPConfigurationStateValue
    setLLRPConfigurationStateValue(v: LLRP_D_LLRPConfigurationStateValue) {
        return this.origin.setSubElement("LLRPConfigurationStateValue", v);
    }

    getLLRPConfigurationStateValue(): LLRP_D_LLRPConfigurationStateValue {
        return this.origin.getSubElement("LLRPConfigurationStateValue");
    }

    // KeepaliveSpec
    setKeepaliveSpec(v: LLRP_D_KeepaliveSpec) {
        return this.origin.setSubElement("KeepaliveSpec", v);
    }

    getKeepaliveSpec(): LLRP_D_KeepaliveSpec {
        return this.origin.getSubElement("KeepaliveSpec");
    }

    // GPIPortCurrentState
    addGPIPortCurrentState(v: LLRP_D_GPIPortCurrentState) {
        return this.origin.addSubElement("GPIPortCurrentState", v);
    }

    getGPIPortCurrentState(): LLRP_D_GPIPortCurrentState[] {
        return this.origin.getSubElement("GPIPortCurrentState");
    }

    // GPOWriteData
    addGPOWriteData(v: LLRP_D_GPOWriteData) {
        return this.origin.addSubElement("GPOWriteData", v);
    }

    getGPOWriteData(): LLRP_D_GPOWriteData[] {
        return this.origin.getSubElement("GPOWriteData");
    }

    // EventsAndReports
    setEventsAndReports(v: LLRP_D_EventsAndReports) {
        return this.origin.setSubElement("EventsAndReports", v);
    }

    getEventsAndReports(): LLRP_D_EventsAndReports {
        return this.origin.getSubElement("EventsAndReports");
    }

    // Custom
    addCustom(v: LLRP_D_Custom) {
        return this.origin.addSubElement("Custom", v);
    }

    getCustom(): LLRP_D_Custom[] {
        return this.origin.getSubElement("Custom");
    }


    // Choices


}

// SET_READER_CONFIG
export class LLRP_C_SET_READER_CONFIG extends LLRPMessage<LLRP_D_SET_READER_CONFIG> {
    constructor(args?: GetCtrArgs<LLRP_C_SET_READER_CONFIG>) {
        super({ ...args, ...{ type: "SET_READER_CONFIG" } });
    }

    // Fields


    // ResetToFactoryDefault
    setResetToFactoryDefault(v: BOOL) {
        return this.origin.setField("ResetToFactoryDefault", v);
    }

    getResetToFactoryDefault() {
        return this.origin.getField("ResetToFactoryDefault") as BOOL;
    }


    // Sub-elements


    // ReaderEventNotificationSpec
    setReaderEventNotificationSpec(v: LLRP_D_ReaderEventNotificationSpec) {
        return this.origin.setSubElement("ReaderEventNotificationSpec", v);
    }

    getReaderEventNotificationSpec(): LLRP_D_ReaderEventNotificationSpec {
        return this.origin.getSubElement("ReaderEventNotificationSpec");
    }

    // AntennaProperties
    addAntennaProperties(v: LLRP_D_AntennaProperties) {
        return this.origin.addSubElement("AntennaProperties", v);
    }

    getAntennaProperties(): LLRP_D_AntennaProperties[] {
        return this.origin.getSubElement("AntennaProperties");
    }

    // AntennaConfiguration
    addAntennaConfiguration(v: LLRP_D_AntennaConfiguration) {
        return this.origin.addSubElement("AntennaConfiguration", v);
    }

    getAntennaConfiguration(): LLRP_D_AntennaConfiguration[] {
        return this.origin.getSubElement("AntennaConfiguration");
    }

    // ROReportSpec
    setROReportSpec(v: LLRP_D_ROReportSpec) {
        return this.origin.setSubElement("ROReportSpec", v);
    }

    getROReportSpec(): LLRP_D_ROReportSpec {
        return this.origin.getSubElement("ROReportSpec");
    }

    // AccessReportSpec
    setAccessReportSpec(v: LLRP_D_AccessReportSpec) {
        return this.origin.setSubElement("AccessReportSpec", v);
    }

    getAccessReportSpec(): LLRP_D_AccessReportSpec {
        return this.origin.getSubElement("AccessReportSpec");
    }

    // KeepaliveSpec
    setKeepaliveSpec(v: LLRP_D_KeepaliveSpec) {
        return this.origin.setSubElement("KeepaliveSpec", v);
    }

    getKeepaliveSpec(): LLRP_D_KeepaliveSpec {
        return this.origin.getSubElement("KeepaliveSpec");
    }

    // GPOWriteData
    addGPOWriteData(v: LLRP_D_GPOWriteData) {
        return this.origin.addSubElement("GPOWriteData", v);
    }

    getGPOWriteData(): LLRP_D_GPOWriteData[] {
        return this.origin.getSubElement("GPOWriteData");
    }

    // GPIPortCurrentState
    addGPIPortCurrentState(v: LLRP_D_GPIPortCurrentState) {
        return this.origin.addSubElement("GPIPortCurrentState", v);
    }

    getGPIPortCurrentState(): LLRP_D_GPIPortCurrentState[] {
        return this.origin.getSubElement("GPIPortCurrentState");
    }

    // EventsAndReports
    setEventsAndReports(v: LLRP_D_EventsAndReports) {
        return this.origin.setSubElement("EventsAndReports", v);
    }

    getEventsAndReports(): LLRP_D_EventsAndReports {
        return this.origin.getSubElement("EventsAndReports");
    }

    // Custom
    addCustom(v: LLRP_D_Custom) {
        return this.origin.addSubElement("Custom", v);
    }

    getCustom(): LLRP_D_Custom[] {
        return this.origin.getSubElement("Custom");
    }


    // Choices


}

// SET_READER_CONFIG_RESPONSE
export class LLRP_C_SET_READER_CONFIG_RESPONSE extends LLRPMessage<LLRP_D_SET_READER_CONFIG_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_SET_READER_CONFIG_RESPONSE>) {
        super({ ...args, ...{ type: "SET_READER_CONFIG_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// CLOSE_CONNECTION
export class LLRP_C_CLOSE_CONNECTION extends LLRPMessage<LLRP_D_CLOSE_CONNECTION> {
    constructor(args?: GetCtrArgs<LLRP_C_CLOSE_CONNECTION>) {
        super({ ...args, ...{ type: "CLOSE_CONNECTION" } });
    }

    // Fields



    // Sub-elements



    // Choices


}

// CLOSE_CONNECTION_RESPONSE
export class LLRP_C_CLOSE_CONNECTION_RESPONSE extends LLRPMessage<LLRP_D_CLOSE_CONNECTION_RESPONSE> {
    constructor(args?: GetCtrArgs<LLRP_C_CLOSE_CONNECTION_RESPONSE>) {
        super({ ...args, ...{ type: "CLOSE_CONNECTION_RESPONSE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}

// GET_REPORT
export class LLRP_C_GET_REPORT extends LLRPMessage<LLRP_D_GET_REPORT> {
    constructor(args?: GetCtrArgs<LLRP_C_GET_REPORT>) {
        super({ ...args, ...{ type: "GET_REPORT" } });
    }

    // Fields



    // Sub-elements



    // Choices


}

// RO_ACCESS_REPORT
export class LLRP_C_RO_ACCESS_REPORT extends LLRPMessage<LLRP_D_RO_ACCESS_REPORT> {
    constructor(args?: GetCtrArgs<LLRP_C_RO_ACCESS_REPORT>) {
        super({ ...args, ...{ type: "RO_ACCESS_REPORT" } });
    }

    // Fields



    // Sub-elements


    // TagReportData
    addTagReportData(v: LLRP_D_TagReportData) {
        return this.origin.addSubElement("TagReportData", v);
    }

    getTagReportData(): LLRP_D_TagReportData[] {
        return this.origin.getSubElement("TagReportData");
    }

    // RFSurveyReportData
    addRFSurveyReportData(v: LLRP_D_RFSurveyReportData) {
        return this.origin.addSubElement("RFSurveyReportData", v);
    }

    getRFSurveyReportData(): LLRP_D_RFSurveyReportData[] {
        return this.origin.getSubElement("RFSurveyReportData");
    }

    // Custom
    addCustom(v: LLRP_D_Custom) {
        return this.origin.addSubElement("Custom", v);
    }

    getCustom(): LLRP_D_Custom[] {
        return this.origin.getSubElement("Custom");
    }


    // Choices


}

// KEEPALIVE
export class LLRP_C_KEEPALIVE extends LLRPMessage<LLRP_D_KEEPALIVE> {
    constructor(args?: GetCtrArgs<LLRP_C_KEEPALIVE>) {
        super({ ...args, ...{ type: "KEEPALIVE" } });
    }

    // Fields



    // Sub-elements



    // Choices


}

// KEEPALIVE_ACK
export class LLRP_C_KEEPALIVE_ACK extends LLRPMessage<LLRP_D_KEEPALIVE_ACK> {
    constructor(args?: GetCtrArgs<LLRP_C_KEEPALIVE_ACK>) {
        super({ ...args, ...{ type: "KEEPALIVE_ACK" } });
    }

    // Fields



    // Sub-elements



    // Choices


}

// READER_EVENT_NOTIFICATION
export class LLRP_C_READER_EVENT_NOTIFICATION extends LLRPMessage<LLRP_D_READER_EVENT_NOTIFICATION> {
    constructor(args?: GetCtrArgs<LLRP_C_READER_EVENT_NOTIFICATION>) {
        super({ ...args, ...{ type: "READER_EVENT_NOTIFICATION" } });
    }

    // Fields



    // Sub-elements


    // ReaderEventNotificationData
    setReaderEventNotificationData(v: LLRP_D_ReaderEventNotificationData) {
        return this.origin.setSubElement("ReaderEventNotificationData", v);
    }

    getReaderEventNotificationData(): LLRP_D_ReaderEventNotificationData {
        return this.origin.getSubElement("ReaderEventNotificationData");
    }


    // Choices


}

// ENABLE_EVENTS_AND_REPORTS
export class LLRP_C_ENABLE_EVENTS_AND_REPORTS extends LLRPMessage<LLRP_D_ENABLE_EVENTS_AND_REPORTS> {
    constructor(args?: GetCtrArgs<LLRP_C_ENABLE_EVENTS_AND_REPORTS>) {
        super({ ...args, ...{ type: "ENABLE_EVENTS_AND_REPORTS" } });
    }

    // Fields



    // Sub-elements



    // Choices


}

// ERROR_MESSAGE
export class LLRP_C_ERROR_MESSAGE extends LLRPMessage<LLRP_D_ERROR_MESSAGE> {
    constructor(args?: GetCtrArgs<LLRP_C_ERROR_MESSAGE>) {
        super({ ...args, ...{ type: "ERROR_MESSAGE" } });
    }

    // Fields



    // Sub-elements


    // LLRPStatus
    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }

    getLLRPStatus(): LLRP_D_LLRPStatus {
        return this.origin.getSubElement("LLRPStatus");
    }


    // Choices


}
